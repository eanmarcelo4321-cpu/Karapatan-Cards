import Foundation
import Capacitor

/// PHASE 1 + 2 native surface: a listening WebSocket server for hosting
/// (Phase 1 requirement — a WKWebView cannot listen for incoming
/// connections) plus Bonjour advertising/discovery (Phase 2, best-effort).
///
/// JS-facing API (see www/js/net-transport.js):
///   startServer({port}) -> {ip, port}
///   stopServer()
///   send({peerId, data})
///   broadcast({data})
///   getLocalIP() -> {ip}
///   startAdvertising({serviceType, port}) / stopAdvertising()
///   startDiscovery({serviceType}) / stopDiscovery()
/// Events: 'message' {peerId, data}, 'peerConnected' {peerId},
///         'peerDisconnected' {peerId}, 'hostFound' {name, ip, port},
///         'hostLost' {name, ip, port}
@objc(LocalMultiplayerPlugin)
public class LocalMultiplayerPlugin: CAPPlugin {

    private let server = MiniWebSocketServer()
    private var netService: NetService?
    private var browser: NetServiceBrowser?
    private var browserDelegate: DiscoveryDelegate?
    private var resolvingServices: [NetService] = []

    public override func load() {
        server.onOpen = { [weak self] peerId in
            self?.notifyListeners("peerConnected", data: ["peerId": peerId])
        }
        server.onMessage = { [weak self] peerId, text in
            self?.notifyListeners("message", data: ["peerId": peerId, "data": text])
        }
        server.onClose = { [weak self] peerId in
            self?.notifyListeners("peerDisconnected", data: ["peerId": peerId])
        }
    }

    // MARK: - Server lifecycle (Phase 1)

    @objc func startServer(_ call: CAPPluginCall) {
        let port = UInt16(call.getInt("port", 8787))
        server.start(port: port) { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let boundPort):
                let ip = self.getLocalIPAddress() ?? "0.0.0.0"
                call.resolve(["ip": ip, "port": Int(boundPort)])
            case .failure(let err):
                call.reject("Failed to start server: \(err.localizedDescription)")
            }
        }
    }

    @objc func stopServer(_ call: CAPPluginCall) {
        server.stop()
        call.resolve()
    }

    @objc func send(_ call: CAPPluginCall) {
        guard let peerId = call.getString("peerId"), let data = call.getString("data") else {
            call.resolve(); return
        }
        server.send(peerId: peerId, text: data)
        call.resolve()
    }

    @objc func broadcast(_ call: CAPPluginCall) {
        guard let data = call.getString("data") else { call.resolve(); return }
        server.broadcast(text: data)
        call.resolve()
    }

    // MARK: - Local IP

    @objc func getLocalIP(_ call: CAPPluginCall) {
        call.resolve(["ip": getLocalIPAddress() ?? NSNull()])
    }

    private func getLocalIPAddress() -> String? {
        var address: String?
        var ifaddrPtr: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&ifaddrPtr) == 0, let firstAddr = ifaddrPtr else { return nil }
        defer { freeifaddrs(ifaddrPtr) }

        for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
            let iface = ptr.pointee
            let family = iface.ifa_addr.pointee.sa_family
            guard family == UInt8(AF_INET) else { continue }
            let name = String(cString: iface.ifa_name)
            // en0 = Wi-Fi on iPhone; bridge100 etc. are simulator/hotspot noise to skip.
            guard name == "en0" || name.hasPrefix("en") else { continue }
            var addr = iface.ifa_addr.pointee
            var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
            getnameinfo(&addr, socklen_t(iface.ifa_addr.pointee.sa_len), &hostname, socklen_t(hostname.count), nil, 0, NI_NUMERICHOST)
            address = String(cString: hostname)
            break
        }
        return address
    }

    // MARK: - Bonjour advertising (Phase 2, best-effort)

    @objc func startAdvertising(_ call: CAPPluginCall) {
        let serviceType = call.getString("serviceType") ?? "_karapatan._tcp."
        let port = Int32(call.getInt("port", 8787))
        // Friendly, non-identifying name chosen by the JS side — deliberately
        // not the device name or IP, so nothing that identifies the host or
        // their network leaks to nearby scanners.
        let displayName = call.getString("name") ?? "KarapatanGame"
        let svc = NetService(domain: "local.", type: normalizeType(serviceType), name: displayName, port: port)
        svc.publish()
        netService = svc
        call.resolve()
    }

    @objc func stopAdvertising(_ call: CAPPluginCall) {
        netService?.stop()
        netService = nil
        call.resolve()
    }

    // MARK: - Bonjour discovery (Phase 2, best-effort)

    @objc func startDiscovery(_ call: CAPPluginCall) {
        let serviceType = call.getString("serviceType") ?? "_karapatan._tcp."
        let b = NetServiceBrowser()
        let delegate = DiscoveryDelegate(plugin: self)
        browserDelegate = delegate
        b.delegate = delegate
        browser = b
        b.searchForServices(ofType: normalizeType(serviceType), inDomain: "local.")
        call.resolve()
    }

    @objc func stopDiscovery(_ call: CAPPluginCall) {
        browser?.stop()
        browser = nil
        browserDelegate = nil
        resolvingServices.removeAll()
        call.resolve()
    }

    private func normalizeType(_ t: String) -> String {
        t.hasSuffix(".") ? t : t + "."
    }

    fileprivate func emitHostFound(name: String, ip: String, port: Int) {
        notifyListeners("hostFound", data: ["name": name, "ip": ip, "port": port])
    }

    fileprivate func emitHostLost(name: String) {
        notifyListeners("hostLost", data: ["name": name, "ip": "", "port": 0])
    }

    fileprivate func trackResolving(_ service: NetService) {
        resolvingServices.append(service)
    }

    fileprivate func untrackResolving(_ service: NetService) {
        resolvingServices.removeAll { $0 === service }
    }

    /// Bridges NetServiceBrowser/NetService delegate callbacks back to the plugin.
    fileprivate class DiscoveryDelegate: NSObject, NetServiceBrowserDelegate, NetServiceDelegate {
        weak var plugin: LocalMultiplayerPlugin?
        init(plugin: LocalMultiplayerPlugin) { self.plugin = plugin }

        func netServiceBrowser(_ browser: NetServiceBrowser, didFind service: NetService, moreComing: Bool) {
            service.delegate = self
            plugin?.trackResolving(service)
            service.resolve(withTimeout: 5)
        }

        func netServiceBrowser(_ browser: NetServiceBrowser, didRemove service: NetService, moreComing: Bool) {
            plugin?.emitHostLost(name: service.name)
        }

        func netServiceDidResolveAddress(_ sender: NetService) {
            guard let plugin = plugin else { return }
            guard let addresses = sender.addresses else { return }
            for data in addresses {
                var ip: String?
                data.withUnsafeBytes { (rawPtr: UnsafeRawBufferPointer) in
                    guard let sockaddrPtr = rawPtr.bindMemory(to: sockaddr.self).baseAddress else { return }
                    if sockaddrPtr.pointee.sa_family == UInt8(AF_INET) {
                        var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                        if getnameinfo(sockaddrPtr, socklen_t(data.count), &hostname, socklen_t(hostname.count), nil, 0, NI_NUMERICHOST) == 0 {
                            ip = String(cString: hostname)
                        }
                    }
                }
                if let ip = ip {
                    plugin.emitHostFound(name: sender.name, ip: ip, port: sender.port)
                    plugin.untrackResolving(sender)
                    return
                }
            }
        }
    }
}
