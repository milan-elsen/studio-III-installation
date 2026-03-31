import ExternalAccessory
import Foundation

final class USBSerialAccessoryTransport: NSObject, DeviceTransport, StreamDelegate {
    var onReceiveLine: ((String) -> Void)?
    var onStateChange: ((DeviceConnectionState) -> Void)?

    private let protocolString: String
    private var session: EASession?
    private var inputBuffer = Data()

    init(protocolString: String) {
        self.protocolString = protocolString
        super.init()
    }

    func connect() throws {
        onStateChange?(.connecting)
        EAAccessoryManager.shared().registerForLocalNotifications()

        guard let accessory = EAAccessoryManager.shared().connectedAccessories.first(where: {
            $0.protocolStrings.contains(protocolString)
        }) else {
            onStateChange?(.failed)
            throw DeviceTransportError.accessoryNotFound
        }

        guard let session = EASession(accessory: accessory, forProtocol: protocolString),
              let inputStream = session.inputStream,
              let outputStream = session.outputStream else {
            onStateChange?(.failed)
            throw DeviceTransportError.streamUnavailable
        }

        self.session = session

        inputStream.delegate = self
        outputStream.delegate = self
        inputStream.schedule(in: .main, forMode: .default)
        outputStream.schedule(in: .main, forMode: .default)
        inputStream.open()
        outputStream.open()
        onStateChange?(.connected)
    }

    func disconnect() {
        guard let session else {
            onStateChange?(.disconnected)
            return
        }

        session.inputStream?.close()
        session.outputStream?.close()
        session.inputStream?.remove(from: .main, forMode: .default)
        session.outputStream?.remove(from: .main, forMode: .default)
        self.session = nil
        onStateChange?(.disconnected)
    }

    func sendLine(_ line: String) throws {
        guard let outputStream = session?.outputStream else {
            throw DeviceTransportError.streamUnavailable
        }
        guard let data = line.data(using: .utf8) else {
            throw DeviceTransportError.writeFailed
        }

        let result = data.withUnsafeBytes { rawBuffer -> Int in
            guard let ptr = rawBuffer.bindMemory(to: UInt8.self).baseAddress else { return -1 }
            return outputStream.write(ptr, maxLength: data.count)
        }

        if result < 0 {
            throw DeviceTransportError.writeFailed
        }
    }

    func stream(_ aStream: Stream, handle eventCode: Stream.Event) {
        switch eventCode {
        case .hasBytesAvailable:
            readIncoming()
        case .errorOccurred, .endEncountered:
            onStateChange?(.failed)
        default:
            break
        }
    }

    private func readIncoming() {
        guard let inputStream = session?.inputStream else { return }

        var buffer = [UInt8](repeating: 0, count: 256)
        while inputStream.hasBytesAvailable {
            let count = inputStream.read(&buffer, maxLength: buffer.count)
            guard count > 0 else { break }
            inputBuffer.append(buffer, count: count)
            drainInputLines()
        }
    }

    private func drainInputLines() {
        while let lineBreak = inputBuffer.firstIndex(of: 0x0A) {
            let lineData = inputBuffer.prefix(upTo: lineBreak)
            inputBuffer.removeSubrange(...lineBreak)
            guard let line = String(data: lineData, encoding: .utf8), !line.isEmpty else { continue }
            onReceiveLine?(line)
        }
    }
}

