import Foundation

final class DeviceClient {
    private let transport: DeviceTransport

    var onMessage: ((DeviceMessage) -> Void)?
    var onStateChange: ((DeviceConnectionState) -> Void)?
    var onRawLine: ((String) -> Void)?

    init(transport: DeviceTransport) {
        self.transport = transport

        self.transport.onReceiveLine = { [weak self] line in
            let tagged = "RX \(line)"
            self?.onRawLine?(tagged)
            print(tagged)
            if let message = DeviceProtocolDecoder.decodeLine(line) {
                self?.onMessage?(message)
            }
        }

        self.transport.onStateChange = { [weak self] state in
            self?.onStateChange?(state)
        }
    }

    func connect() throws {
        try transport.connect()
    }

    func disconnect() {
        transport.disconnect()
    }

    func send(_ command: DeviceCommand) throws {
        let line = command.line
        let tagged = "TX \(line.trimmingCharacters(in: .whitespacesAndNewlines))"
        onRawLine?(tagged)
        print(tagged)
        try transport.sendLine(line)
    }
}
