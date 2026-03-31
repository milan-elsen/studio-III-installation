import Foundation

protocol DeviceTransport: AnyObject {
    var onReceiveLine: ((String) -> Void)? { get set }
    var onStateChange: ((DeviceConnectionState) -> Void)? { get set }
    func connect() throws
    func disconnect()
    func sendLine(_ line: String) throws
}

enum DeviceTransportError: Error, LocalizedError {
    case accessoryNotFound
    case streamUnavailable
    case writeFailed

    var errorDescription: String? {
        switch self {
        case .accessoryNotFound:
            return "No compatible USB accessory was found."
        case .streamUnavailable:
            return "Accessory session streams are unavailable."
        case .writeFailed:
            return "Writing to accessory failed."
        }
    }
}

