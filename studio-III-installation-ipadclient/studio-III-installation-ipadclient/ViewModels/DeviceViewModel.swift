import Combine
import Foundation

@MainActor
final class DeviceViewModel: ObservableObject {
    @Published var connectionState: DeviceConnectionState = .disconnected
    @Published var latestWeightGrams: Double?
    @Published var latestRawValue: Int?
    @Published var calibrationFactorText = "1.000000"
    @Published var knownWeightText = "100.0"
    @Published var statusText = "Not connected"
    @Published var errorText: String?
    @Published var recentLines: [String] = []

    private let client: DeviceClient

    init() {
        let transport = USBSerialAccessoryTransport(protocolString: "com.studio3.scaleaudio")
        client = DeviceClient(transport: transport)
        bindCallbacks()
    }

    func connect() {
        do {
            try client.connect()
        } catch {
            errorText = error.localizedDescription
            connectionState = .failed
        }
    }

    func disconnect() {
        client.disconnect()
    }

    func tare() {
        send(.tare)
    }

    func requestWeight() {
        send(.readWeight)
    }

    func requestRaw() {
        send(.readRaw)
    }

    func requestCalibrationFactor() {
        send(.getCalibration)
    }

    func setCalibrationFactor() {
        guard let factor = Double(calibrationFactorText), factor > 0 else {
            errorText = "Enter a valid calibration factor > 0"
            return
        }
        send(.setCalibration(factor: factor))
    }

    func calibrateUsingKnownWeight() {
        guard let grams = Double(knownWeightText), grams > 0 else {
            errorText = "Enter a valid known weight in grams"
            return
        }
        send(.calibrate(knownGrams: grams))
    }

    func playTestTone() {
        send(.playTone(frequencyHz: 880, durationMs: 250))
    }

    func stopTone() {
        send(.stopTone)
    }

    func printTestLabel() {
        send(.printTestLabel)
    }

    func printWasteImage() {
        send(.printWasteImage)
    }

    func printReceipt(_ receipt: String) {
        let lines = receipt.components(separatedBy: .newlines)
        guard !lines.isEmpty else {
            errorText = "Receipt is empty"
            return
        }

        statusText = "Printing receipt"
        for line in lines {
            if !send(.printerLine(line)) {
                statusText = "Print failed"
                return
            }
        }
        if !send(.feedPaper(lines: 3)) {
            statusText = "Print failed"
            return
        }
        statusText = "Receipt sent"
    }

    private func bindCallbacks() {
        client.onStateChange = { [weak self] state in
            Task { @MainActor in
                self?.connectionState = state
                if state == .connected {
                    self?.statusText = "Connected"
                    self?.errorText = nil
                }
            }
        }

        client.onMessage = { [weak self] message in
            Task { @MainActor in
                if let grams = message.grams {
                    self?.latestWeightGrams = grams
                }
                if let raw = message.raw {
                    self?.latestRawValue = raw
                }
                if let factor = message.factor {
                    self?.calibrationFactorText = String(format: "%.6f", factor)
                }
                if let value = message.value {
                    self?.statusText = value
                }
                if let reason = message.reason {
                    self?.errorText = reason
                }
            }
        }

        client.onRawLine = { [weak self] line in
            Task { @MainActor in
                self?.recentLines.insert(line, at: 0)
                self?.recentLines = Array(self?.recentLines.prefix(10) ?? [])
            }
        }
    }

    @discardableResult
    private func send(_ command: DeviceCommand) -> Bool {
        do {
            try client.send(command)
            return true
        } catch {
            errorText = error.localizedDescription
            return false
        }
    }
}
