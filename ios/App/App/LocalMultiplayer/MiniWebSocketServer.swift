import Foundation
import Network
import CryptoKit

/// A minimal, self-contained RFC 6455 WebSocket server built on
/// Network.framework. Handles the HTTP upgrade handshake and unfragmented
/// text-frame framing only (small single-frame JSON messages, which is all
/// this app ever sends).
///
/// This exists because a Capacitor WKWebView can open *outgoing* WebSocket
/// connections but cannot *listen* for incoming ones — hosting a local game
/// requires a small piece of native code, and this is it.
final class MiniWebSocketServer {

    private static let wsGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    var onOpen: ((String) -> Void)?
    var onMessage: ((String, String) -> Void)?
    var onClose: ((String) -> Void)?

    private var listener: NWListener?
    private let queue = DispatchQueue(label: "karapatan.localmultiplayer.ws")
    private var clients: [String: ClientConn] = [:]

    /// Binds a listener on `port` (0 = any free port). Completion delivers the
    /// actual bound port, or an error.
    func start(port: UInt16, completion: @escaping (Result<UInt16, Error>) -> Void) {
        do {
            let params = NWParameters.tcp
            let nwPort = port == 0 ? NWEndpoint.Port.any : NWEndpoint.Port(rawValue: port)!
            let l = try NWListener(using: params, on: nwPort)
            listener = l
            var completed = false
            l.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    if !completed { completed = true; completion(.success(l.port?.rawValue ?? port)) }
                case .failed(let err):
                    if !completed { completed = true; completion(.failure(err)) }
                default: break
                }
            }
            l.newConnectionHandler = { [weak self] conn in self?.acceptConnection(conn) }
            l.start(queue: queue)
        } catch {
            completion(.failure(error))
        }
    }

    func stop() {
        listener?.cancel()
        listener = nil
        for (_, c) in clients { c.connection.cancel() }
        clients.removeAll()
    }

    func send(peerId: String, text: String) {
        clients[peerId]?.sendText(text)
    }

    func broadcast(text: String) {
        for (_, c) in clients { c.sendText(text) }
    }

    // MARK: - Connection handling

    private func acceptConnection(_ connection: NWConnection) {
        let peerId = UUID().uuidString
        let conn = ClientConn(peerId: peerId, connection: connection)
        connection.stateUpdateHandler = { [weak self] state in
            guard let self = self else { return }
            switch state {
            case .ready:
                self.readHandshake(conn)
            case .failed, .cancelled:
                self.clients.removeValue(forKey: peerId)
                self.onClose?(peerId)
            default: break
            }
        }
        connection.start(queue: queue)
    }

    private func readHandshake(_ conn: ClientConn) {
        conn.connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) { [weak self] data, _, isComplete, error in
            guard let self = self else { return }
            if let data = data, !data.isEmpty { conn.handshakeBuffer.append(data) }
            if error != nil || (isComplete && conn.handshakeBuffer.isEmpty) {
                conn.connection.cancel(); return
            }
            // Wait for full HTTP header block.
            if let range = conn.handshakeBuffer.range(of: Data("\r\n\r\n".utf8)) {
                let headerData = conn.handshakeBuffer.subdata(in: 0..<range.upperBound)
                conn.handshakeBuffer.removeSubrange(0..<range.upperBound) // leftover kept for frame parsing
                guard let accept = self.computeAccept(from: headerData) else {
                    conn.connection.cancel(); return
                }
                let response = "HTTP/1.1 101 Switching Protocols\r\n" +
                    "Upgrade: websocket\r\n" +
                    "Connection: Upgrade\r\n" +
                    "Sec-WebSocket-Accept: \(accept)\r\n\r\n"
                conn.connection.send(content: response.data(using: .ascii), completion: .contentProcessed { _ in
                    self.clients[conn.peerId] = conn
                    self.onOpen?(conn.peerId)
                    // Any bytes already buffered after the header block are the start of the first frame.
                    if !conn.handshakeBuffer.isEmpty {
                        self.processFrameBytes(conn, conn.handshakeBuffer)
                        conn.handshakeBuffer.removeAll()
                    }
                    self.readFrames(conn)
                })
            } else {
                self.readHandshake(conn) // keep accumulating headers
            }
        }
    }

    private func computeAccept(from headerData: Data) -> String? {
        guard let text = String(data: headerData, encoding: .ascii) else { return nil }
        var key: String?
        for line in text.split(separator: "\r\n") {
            let parts = line.split(separator: ":", maxSplits: 1)
            if parts.count == 2, parts[0].trimmingCharacters(in: .whitespaces).lowercased() == "sec-websocket-key" {
                key = parts[1].trimmingCharacters(in: .whitespaces)
            }
        }
        guard let k = key else { return nil }
        let digest = Insecure.SHA1.hash(data: Data((k + Self.wsGUID).utf8))
        return Data(digest).base64EncodedString()
    }

    private func readFrames(_ conn: ClientConn) {
        conn.connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, _, isComplete, error in
            guard let self = self else { return }
            if let data = data, !data.isEmpty {
                self.processFrameBytes(conn, data)
            }
            if error != nil || (isComplete && (data?.isEmpty ?? true)) {
                conn.connection.cancel()
                return
            }
            self.readFrames(conn)
        }
    }

    /// Appends incoming bytes to the connection's frame buffer and extracts
    /// as many complete frames as are available (client frames are always
    /// masked per RFC 6455).
    private func processFrameBytes(_ conn: ClientConn, _ data: Data) {
        conn.frameBuffer.append(data)
        var buf = conn.frameBuffer
        var consumed = 0

        while true {
            guard buf.count - consumed >= 2 else { break }
            let b0 = buf[buf.startIndex + consumed]
            let b1 = buf[buf.startIndex + consumed + 1]
            let opcode = b0 & 0x0F
            let masked = (b1 & 0x80) != 0
            var len = UInt64(b1 & 0x7F)
            var offset = consumed + 2

            if len == 126 {
                guard buf.count - offset >= 2 else { break }
                len = UInt64(buf[buf.startIndex + offset]) << 8 | UInt64(buf[buf.startIndex + offset + 1])
                offset += 2
            } else if len == 127 {
                guard buf.count - offset >= 8 else { break }
                var l: UInt64 = 0
                for i in 0..<8 { l = (l << 8) | UInt64(buf[buf.startIndex + offset + i]) }
                len = l
                offset += 8
            }

            var maskKey: [UInt8] = [0, 0, 0, 0]
            if masked {
                guard buf.count - offset >= 4 else { break }
                for i in 0..<4 { maskKey[i] = buf[buf.startIndex + offset + i] }
                offset += 4
            }

            guard buf.count - offset >= Int(len) else { break }
            var payload = [UInt8](buf[(buf.startIndex + offset)..<(buf.startIndex + offset + Int(len))])
            if masked { for i in 0..<payload.count { payload[i] ^= maskKey[i % 4] } }
            offset += Int(len)
            consumed = offset

            switch opcode {
            case 0x8: // close
                conn.sendFrame(firstByte: 0x88, payload: [])
                conn.connection.cancel()
            case 0x9: // ping -> pong
                conn.sendFrame(firstByte: 0x8A, payload: payload)
            case 0x1: // text
                if let text = String(bytes: payload, encoding: .utf8) {
                    onMessage?(conn.peerId, text)
                }
            default: break
            }
        }

        conn.frameBuffer.removeSubrange(0..<consumed)
    }

    private final class ClientConn {
        let peerId: String
        let connection: NWConnection
        var handshakeBuffer = Data()
        var frameBuffer = Data()

        init(peerId: String, connection: NWConnection) {
            self.peerId = peerId
            self.connection = connection
        }

        func sendText(_ text: String) {
            sendFrame(firstByte: 0x81, payload: [UInt8](text.utf8)) // FIN + text opcode, server frames unmasked
        }

        func sendFrame(firstByte: UInt8, payload: [UInt8]) {
            var out = [UInt8]()
            out.append(firstByte)
            let len = payload.count
            if len <= 125 {
                out.append(UInt8(len))
            } else if len <= 65535 {
                out.append(126)
                out.append(UInt8((len >> 8) & 0xFF))
                out.append(UInt8(len & 0xFF))
            } else {
                out.append(127)
                for i in stride(from: 7, through: 0, by: -1) { out.append(UInt8((len >> (8 * i)) & 0xFF)) }
            }
            out.append(contentsOf: payload)
            connection.send(content: Data(out), completion: .contentProcessed { _ in })
        }
    }
}
