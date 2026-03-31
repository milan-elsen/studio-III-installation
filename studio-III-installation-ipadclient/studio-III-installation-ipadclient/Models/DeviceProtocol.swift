import Foundation

enum DeviceConnectionState: String {
    case disconnected
    case connecting
    case connected
    case failed
}

enum DeviceCommand {
    case ping
    case readWeight
    case readRaw
    case tare
    case getCalibration
    case setCalibration(factor: Double)
    case calibrate(knownGrams: Double)
    case playTone(frequencyHz: Int, durationMs: Int)
    case stopTone
    case printTestLabel
    case printWasteImage
    case printerLine(String)
    case feedPaper(lines: Int)

    private static func fmt(_ value: Double) -> String {
        String(format: "%.6f", value)
    }

    var line: String {
        switch self {
        case .ping:
            return "PING\n"
        case .readWeight:
            return "READ_WEIGHT\n"
        case .readRaw:
            return "READ_RAW\n"
        case .tare:
            return "TARE\n"
        case .getCalibration:
            return "GET_CAL\n"
        case let .setCalibration(factor):
            return "SET_CAL \(Self.fmt(factor))\n"
        case let .calibrate(knownGrams):
            return "CALIBRATE \(Self.fmt(knownGrams))\n"
        case let .playTone(frequencyHz, durationMs):
            return "PLAY_TONE \(frequencyHz) \(durationMs)\n"
        case .stopTone:
            return "STOP_TONE\n"
        case .printTestLabel:
            return "PRINT_TEST\n"
        case .printWasteImage:
            return "PRINT_IMAGE\n"
        case let .printerLine(line):
            return "RAW \(line)\n"
        case let .feedPaper(lines):
            return "FEED \(lines)\n"
        }
    }
}

struct DeviceMessage: Decodable {
    let type: String
    let grams: Double?
    let raw: Int?
    let factor: Double?
    let knownGrams: Double?
    let value: String?
    let reason: String?

    enum CodingKeys: String, CodingKey {
        case type
        case grams
        case raw
        case factor
        case knownGrams = "known_grams"
        case value
        case reason
    }

    var summary: String {
        if let grams {
            return "Weight: \(String(format: "%.1f", grams)) g"
        }
        if let raw {
            return "Raw: \(raw)"
        }
        if let factor {
            return "Calibration factor: \(String(format: "%.6f", factor))"
        }
        if let knownGrams {
            return "Known weight: \(String(format: "%.1f", knownGrams)) g"
        }
        if let value {
            return "Status: \(value)"
        }
        if let reason {
            return "Error: \(reason)"
        }
        return "Message: \(type)"
    }
}

enum DeviceProtocolDecoder {
    static func decodeLine(_ line: String) -> DeviceMessage? {
        guard let data = line.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(DeviceMessage.self, from: data)
    }
}
