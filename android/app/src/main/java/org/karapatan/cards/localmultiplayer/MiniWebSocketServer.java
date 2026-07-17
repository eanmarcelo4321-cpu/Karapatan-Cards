package org.karapatan.cards.localmultiplayer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import android.util.Base64;
import android.util.Log;

/**
 * A minimal, self-contained RFC 6455 WebSocket server. Handles the HTTP
 * upgrade handshake and unfragmented text-frame framing only (which is all
 * this app ever sends — small single-frame JSON messages, well under any
 * fragmentation threshold a browser WebSocket client would apply).
 *
 * This exists because a Capacitor WebView can open *outgoing* WebSocket
 * connections but cannot *listen* for incoming ones — hosting a local game
 * requires a small piece of native code, and this is it.
 */
public class MiniWebSocketServer {

    private static final String TAG = "MiniWebSocketServer";
    private static final String WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    public interface Listener {
        void onOpen(String peerId);
        void onMessage(String peerId, String text);
        void onClose(String peerId);
    }

    private ServerSocket serverSocket;
    private final ExecutorService pool = Executors.newCachedThreadPool();
    private final Map<String, ClientConn> clients = new ConcurrentHashMap<>();
    private final Listener listener;
    private volatile boolean running = false;

    public MiniWebSocketServer(Listener listener) {
        this.listener = listener;
    }

    /** Binds to the given port (0 = pick any free port) and returns the bound port. */
    public int start(int port) throws IOException {
        serverSocket = new ServerSocket(port);
        running = true;
        pool.execute(this::acceptLoop);
        return serverSocket.getLocalPort();
    }

    public void stop() {
        running = false;
        try { if (serverSocket != null) serverSocket.close(); } catch (IOException ignored) {}
        for (ClientConn c : clients.values()) c.close();
        clients.clear();
    }

    public void send(String peerId, String text) {
        ClientConn c = clients.get(peerId);
        if (c != null) c.sendText(text);
    }

    public void broadcast(String text) {
        for (ClientConn c : clients.values()) c.sendText(text);
    }

    private void acceptLoop() {
        while (running) {
            try {
                Socket sock = serverSocket.accept();
                pool.execute(() -> handleClient(sock));
            } catch (IOException e) {
                if (running) Log.w(TAG, "accept loop error", e);
                break;
            }
        }
    }

    private void handleClient(Socket sock) {
        String peerId = UUID.randomUUID().toString();
        try {
            sock.setTcpNoDelay(true);
            InputStream in = sock.getInputStream();
            OutputStream out = sock.getOutputStream();

            if (!performHandshake(in, out)) { sock.close(); return; }

            ClientConn conn = new ClientConn(peerId, sock, out);
            clients.put(peerId, conn);
            listener.onOpen(peerId);

            readFrameLoop(peerId, in, conn);
        } catch (Exception e) {
            Log.w(TAG, "client " + peerId + " error", e);
        } finally {
            clients.remove(peerId);
            try { sock.close(); } catch (IOException ignored) {}
            listener.onClose(peerId);
        }
    }

    /** Reads the HTTP upgrade request headers and writes the 101 response. */
    private boolean performHandshake(InputStream in, OutputStream out) throws IOException, NoSuchAlgorithmException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.US_ASCII));
        Map<String, String> headers = new HashMap<>();
        String line = reader.readLine();
        if (line == null || !line.startsWith("GET")) return false;
        while ((line = reader.readLine()) != null && !line.isEmpty()) {
            int idx = line.indexOf(':');
            if (idx > 0) headers.put(line.substring(0, idx).trim().toLowerCase(), line.substring(idx + 1).trim());
        }
        String key = headers.get("sec-websocket-key");
        if (key == null) return false;

        MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
        String accept = Base64.encodeToString(sha1.digest((key + WS_GUID).getBytes(StandardCharsets.US_ASCII)), Base64.NO_WRAP);

        String response = "HTTP/1.1 101 Switching Protocols\r\n" +
                "Upgrade: websocket\r\n" +
                "Connection: Upgrade\r\n" +
                "Sec-WebSocket-Accept: " + accept + "\r\n\r\n";
        out.write(response.getBytes(StandardCharsets.US_ASCII));
        out.flush();
        return true;
    }

    /** Reads client->server frames (always masked per RFC 6455) until close/EOF. */
    private void readFrameLoop(String peerId, InputStream in, ClientConn conn) throws IOException {
        while (running) {
            int b0 = in.read();
            if (b0 == -1) return;
            int opcode = b0 & 0x0F;
            int b1 = in.read();
            if (b1 == -1) return;
            boolean masked = (b1 & 0x80) != 0;
            long len = b1 & 0x7F;
            if (len == 126) {
                len = ((in.read() & 0xFF) << 8) | (in.read() & 0xFF);
            } else if (len == 127) {
                long l = 0;
                for (int i = 0; i < 8; i++) l = (l << 8) | (in.read() & 0xFF);
                len = l;
            }
            byte[] maskKey = new byte[4];
            if (masked) {
                int got = 0;
                while (got < 4) { int r = in.read(maskKey, got, 4 - got); if (r == -1) return; got += r; }
            }
            byte[] payload = new byte[(int) len];
            int got = 0;
            while (got < len) { int r = in.read(payload, got, (int) len - got); if (r == -1) return; got += r; }
            if (masked) {
                for (int i = 0; i < payload.length; i++) payload[i] ^= maskKey[i % 4];
            }

            if (opcode == 0x8) { // close
                conn.sendClose();
                return;
            } else if (opcode == 0x9) { // ping -> pong
                conn.sendFrame((byte) 0x8A, payload);
            } else if (opcode == 0x1) { // text
                String text = new String(payload, StandardCharsets.UTF_8);
                listener.onMessage(peerId, text);
            }
            // binary/continuation frames are not used by this protocol; ignored.
        }
    }

    private static class ClientConn {
        final String peerId;
        final Socket sock;
        final OutputStream out;

        ClientConn(String peerId, Socket sock, OutputStream out) {
            this.peerId = peerId; this.sock = sock; this.out = out;
        }

        synchronized void sendText(String text) {
            byte[] payload = text.getBytes(StandardCharsets.UTF_8);
            sendFrame((byte) 0x81, payload); // FIN + text opcode, server frames are unmasked
        }

        synchronized void sendFrame(byte firstByte, byte[] payload) {
            try {
                java.io.ByteArrayOutputStream header = new java.io.ByteArrayOutputStream();
                header.write(firstByte);
                int len = payload.length;
                if (len <= 125) {
                    header.write(len);
                } else if (len <= 65535) {
                    header.write(126);
                    header.write((len >> 8) & 0xFF);
                    header.write(len & 0xFF);
                } else {
                    header.write(127);
                    for (int i = 7; i >= 0; i--) header.write((int) ((len >> (8 * i)) & 0xFF));
                }
                out.write(header.toByteArray());
                out.write(payload);
                out.flush();
            } catch (IOException e) {
                Log.w(TAG, "send failed for " + peerId, e);
            }
        }

        void sendClose() {
            try { sendFrame((byte) 0x88, new byte[0]); } catch (Exception ignored) {}
        }

        void close() {
            try { sock.close(); } catch (IOException ignored) {}
        }
    }
}
