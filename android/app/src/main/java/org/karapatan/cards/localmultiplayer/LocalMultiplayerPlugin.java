package org.karapatan.cards.localmultiplayer;

import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * PHASE 1 + 2 native surface: a listening WebSocket server for hosting
 * (Phase 1 requirement — see net-transport.js) plus local-network
 * advertising/discovery via Android's NSD (Phase 2, best-effort).
 *
 * JS-facing API (see www/js/net-transport.js):
 *   startServer({port}) -> {ip, port}
 *   stopServer()
 *   send({peerId, data})
 *   broadcast({data})
 *   getLocalIP() -> {ip}
 *   startAdvertising({serviceType, port}) / stopAdvertising()
 *   startDiscovery({serviceType}) / stopDiscovery()
 * Events: 'message' {peerId, data}, 'peerConnected' {peerId},
 *         'peerDisconnected' {peerId}, 'hostFound' {name, ip, port},
 *         'hostLost' {name, ip, port}
 */
@CapacitorPlugin(name = "LocalMultiplayer")
public class LocalMultiplayerPlugin extends Plugin implements MiniWebSocketServer.Listener {

    private static final String TAG = "LocalMultiplayerPlugin";

    private MiniWebSocketServer server;
    private NsdManager nsdManager;
    private NsdManager.RegistrationListener registrationListener;
    private NsdManager.DiscoveryListener discoveryListener;
    private final Map<String, NsdServiceInfo> discoveredRaw = new HashMap<>();

    /* ---------------- Server lifecycle (Phase 1) ---------------- */

    @PluginMethod
    public void startServer(PluginCall call) {
        int port = call.getInt("port", 8787);
        Log.d(TAG, "[LOCAL PLAY] Starting host...");
        try {
            if (server != null) server.stop();
            server = new MiniWebSocketServer(this);
            int boundPort = server.start(port);
            String ip = getLocalIpAddress();
            Log.d(TAG, "[LOCAL PLAY] Selected host IP: " + ip + "  Server port: " + boundPort);
            JSObject ret = new JSObject();
            ret.put("ip", ip != null ? ip : "0.0.0.0");
            ret.put("port", boundPort);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "[LOCAL PLAY] startServer failed", e);
            call.reject("Failed to start server: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopServer(PluginCall call) {
        if (server != null) { server.stop(); server = null; }
        call.resolve();
    }

    @PluginMethod
    public void send(PluginCall call) {
        String peerId = call.getString("peerId");
        String data = call.getString("data");
        if (server != null && peerId != null && data != null) server.send(peerId, data);
        call.resolve();
    }

    @PluginMethod
    public void broadcast(PluginCall call) {
        String data = call.getString("data");
        if (server != null && data != null) server.broadcast(data);
        call.resolve();
    }

    /* ---------------- MiniWebSocketServer.Listener (background thread!) ---------------- */

    @Override
    public void onOpen(String peerId) {
        JSObject data = new JSObject();
        data.put("peerId", peerId);
        notifyListeners("peerConnected", data);
    }

    @Override
    public void onMessage(String peerId, String text) {
        JSObject data = new JSObject();
        data.put("peerId", peerId);
        data.put("data", text);
        notifyListeners("message", data);
    }

    @Override
    public void onClose(String peerId) {
        JSObject data = new JSObject();
        data.put("peerId", peerId);
        notifyListeners("peerDisconnected", data);
    }

    /* ---------------- Local IP (needed both to display and to advertise) ---------------- */

    @PluginMethod
    public void getLocalIP(PluginCall call) {
        String ip = getLocalIpAddress();
        JSObject ret = new JSObject();
        ret.put("ip", ip);
        call.resolve(ret);
    }

    /** Picks the local IPv4 address most likely to be reachable by another
     *  phone on the same Wi-Fi/hotspot. A phone commonly has SEVERAL active
     *  network interfaces simultaneously (Wi-Fi, mobile data, and the
     *  hotspot AP interface can all be "up" at once) — iterating
     *  NetworkInterface.getNetworkInterfaces() and returning the FIRST
     *  non-loopback IPv4 address found (the previous behavior) has no
     *  guaranteed order and can easily return a mobile-data IP instead of
     *  the actual LAN-reachable one, silently breaking the manual game
     *  code (which encodes whatever this function returns) even while NSD
     *  discovery still works fine (it resolves independently at the OS
     *  level). This now explicitly prefers known Wi-Fi/hotspot interface
     *  name prefixes first, and only falls back to "first available" if
     *  none of those are found. */
    private String getLocalIpAddress() {
        try {
            java.util.List<String> preferredPrefixes = java.util.Arrays.asList("wlan", "ap", "swlan", "softap");
            Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
            java.util.List<NetworkInterface> candidates = new java.util.ArrayList<>();
            while (ifaces != null && ifaces.hasMoreElements()) {
                NetworkInterface iface = ifaces.nextElement();
                if (!iface.isUp() || iface.isLoopback() || iface.isVirtual()) continue;
                candidates.add(iface);
            }

            Log.d(TAG, "[LOCAL PLAY] Network interfaces detected: " + candidates.size());
            for (NetworkInterface iface : candidates) {
                Log.d(TAG, "[LOCAL PLAY]   interface: " + iface.getName());
            }

            // Pass 1: known Wi-Fi/hotspot interface name prefixes
            for (NetworkInterface iface : candidates) {
                String name = iface.getName().toLowerCase();
                for (String prefix : preferredPrefixes) {
                    if (name.startsWith(prefix)) {
                        String ip = firstIPv4(iface);
                        if (ip != null) {
                            Log.d(TAG, "[LOCAL PLAY] Selected host IP (preferred Wi-Fi/hotspot interface " + iface.getName() + "): " + ip);
                            return ip;
                        }
                    }
                }
            }
            // Pass 2: fall back to the first non-loopback IPv4 address on any interface
            for (NetworkInterface iface : candidates) {
                String ip = firstIPv4(iface);
                if (ip != null) {
                    Log.d(TAG, "[LOCAL PLAY] Selected host IP (fallback, interface " + iface.getName() + "): " + ip);
                    return ip;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "[LOCAL PLAY] getLocalIpAddress failed", e);
        }
        Log.w(TAG, "[LOCAL PLAY] No usable local IP address found");
        return null;
    }

    private String firstIPv4(NetworkInterface iface) {
        Enumeration<InetAddress> addrs = iface.getInetAddresses();
        while (addrs.hasMoreElements()) {
            InetAddress addr = addrs.nextElement();
            if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                return addr.getHostAddress();
            }
        }
        return null;
    }

    /* ---------------- NSD advertising (Phase 2, best-effort) ----------------
       Note: apps targeting Android 13+ (API 33) may need the runtime
       NEARBY_WIFI_DEVICES permission for NSD to reliably see other hosts on
       some OEM builds. Manual IP entry (Phase 1) always works regardless. */

    @PluginMethod
    public void startAdvertising(PluginCall call) {
        String serviceType = call.getString("serviceType", "_karapatan._tcp");
        int port = call.getInt("port", 8787);
        // Friendly, non-identifying name chosen by the JS side (e.g. "Brave
        // Falcon Game") — deliberately NOT the device name or IP, so nothing
        // that identifies the host or their network leaks to nearby scanners.
        String displayName = call.getString("name", "KarapatanGame");
        try {
            nsdManager = (NsdManager) getContext().getSystemService(android.content.Context.NSD_SERVICE);
            NsdServiceInfo serviceInfo = new NsdServiceInfo();
            serviceInfo.setServiceName(displayName);
            serviceInfo.setServiceType(serviceType);
            serviceInfo.setPort(port);

            registrationListener = new NsdManager.RegistrationListener() {
                @Override public void onServiceRegistered(NsdServiceInfo info) { }
                @Override public void onRegistrationFailed(NsdServiceInfo info, int errorCode) {
                    Log.w(TAG, "NSD registration failed: " + errorCode);
                }
                @Override public void onServiceUnregistered(NsdServiceInfo info) { }
                @Override public void onUnregistrationFailed(NsdServiceInfo info, int errorCode) { }
            };
            nsdManager.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener);
            call.resolve();
        } catch (Exception e) {
            call.reject("advertising unavailable: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopAdvertising(PluginCall call) {
        try {
            if (nsdManager != null && registrationListener != null) nsdManager.unregisterService(registrationListener);
        } catch (Exception ignored) {}
        registrationListener = null;
        call.resolve();
    }

    /* ---------------- NSD discovery (Phase 2, best-effort) ---------------- */

    @PluginMethod
    public void startDiscovery(PluginCall call) {
        String serviceType = call.getString("serviceType", "_karapatan._tcp");
        try {
            nsdManager = (NsdManager) getContext().getSystemService(android.content.Context.NSD_SERVICE);
            discoveredRaw.clear();
            discoveryListener = new NsdManager.DiscoveryListener() {
                @Override public void onDiscoveryStarted(String regType) { }
                @Override public void onStartDiscoveryFailed(String serviceType, int errorCode) {
                    Log.w(TAG, "NSD discovery start failed: " + errorCode);
                }
                @Override public void onDiscoveryStopped(String serviceType) { }
                @Override public void onStopDiscoveryFailed(String serviceType, int errorCode) { }

                @Override
                public void onServiceFound(NsdServiceInfo service) {
                    Log.d(TAG, "[LOCAL PLAY] Nearby game discovered (resolving): " + service.getServiceName());
                    nsdManager.resolveService(service, new NsdManager.ResolveListener() {
                        @Override public void onResolveFailed(NsdServiceInfo info, int errorCode) {
                            Log.w(TAG, "[LOCAL PLAY] Resolve failed for " + info.getServiceName() + ", error code " + errorCode);
                        }
                        @Override public void onServiceResolved(NsdServiceInfo info) {
                            discoveredRaw.put(info.getServiceName(), info);
                            String resolvedIp = info.getHost() != null ? info.getHost().getHostAddress() : "";
                            Log.d(TAG, "[LOCAL PLAY] Game code: " + info.getServiceName() + "  Host IP: " + resolvedIp + "  Host port: " + info.getPort());
                            JSObject data = new JSObject();
                            data.put("name", info.getServiceName());
                            data.put("ip", resolvedIp);
                            data.put("port", info.getPort());
                            notifyListeners("hostFound", data);
                        }
                    });
                }

                @Override
                public void onServiceLost(NsdServiceInfo service) {
                    NsdServiceInfo known = discoveredRaw.remove(service.getServiceName());
                    JSObject data = new JSObject();
                    data.put("name", service.getServiceName());
                    data.put("ip", known != null && known.getHost() != null ? known.getHost().getHostAddress() : "");
                    data.put("port", known != null ? known.getPort() : 0);
                    notifyListeners("hostLost", data);
                }
            };
            nsdManager.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, discoveryListener);
            call.resolve();
        } catch (Exception e) {
            call.reject("discovery unavailable: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        try {
            if (nsdManager != null && discoveryListener != null) nsdManager.stopServiceDiscovery(discoveryListener);
        } catch (Exception ignored) {}
        discoveryListener = null;
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (server != null) { server.stop(); server = null; }
        try { if (nsdManager != null && registrationListener != null) nsdManager.unregisterService(registrationListener); } catch (Exception ignored) {}
        try { if (nsdManager != null && discoveryListener != null) nsdManager.stopServiceDiscovery(discoveryListener); } catch (Exception ignored) {}
        super.handleOnDestroy();
    }
}
