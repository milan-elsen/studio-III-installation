import Foundation
import Combine
import SwiftUI

enum WeightCapturePhase {
    case before
    case after
}

enum JourneyOutputChoice: String, CaseIterable, Identifiable {
    case receipt = "Print Receipt"
    case digitalCopy = "Digital Copy"

    var id: String { rawValue }

    var symbolName: String {
        switch self {
        case .receipt:
            return "printer.fill"
        case .digitalCopy:
            return "qrcode"
        }
    }
}

@MainActor
final class JourneyFlowViewModel: ObservableObject {
    @Published var totalWeight: Double?
    @Published var beforeWeight: Double?
    @Published var afterWeight: Double?
    @Published var liveWeight: Double?
    @Published var feelingValue: Double = 0.5
    @Published var selectedOutput: JourneyOutputChoice = .receipt
    @Published var statusText = "Ready"
    @Published var lastOutputText = ""
    @Published var receiptCode = JourneyFlowViewModel.makeReceiptCode()

    var onRequestBeforeWeight: (() -> Void)?
    var onRequestAfterWeight: (() -> Void)?
    var onPrintReceipt: ((String) -> Void)?
    var onShowQRCode: ((String) -> Void)?
    var onSendDigitalCopy: ((String) -> Void)?
    private var liveWeightTask: Task<Void, Never>?

    init(
        onRequestBeforeWeight: (() -> Void)? = nil,
        onRequestAfterWeight: (() -> Void)? = nil,
        onPrintReceipt: ((String) -> Void)? = nil,
        onShowQRCode: ((String) -> Void)? = nil,
        onSendDigitalCopy: ((String) -> Void)? = nil
    ) {
        self.onRequestBeforeWeight = onRequestBeforeWeight
        self.onRequestAfterWeight = onRequestAfterWeight
        self.onPrintReceipt = onPrintReceipt
        self.onShowQRCode = onShowQRCode
        self.onSendDigitalCopy = onSendDigitalCopy
        receiptCode = Self.makeReceiptCode()
    }

    var removedWeight: Double {
        max((beforeWeight ?? 0) - (afterWeight ?? 0), 0)
    }

    var formattedBeforeWeight: String {
        formatWeight(beforeWeight)
    }

    var formattedTotalWeight: String {
        formatWeight(totalWeight)
    }

    var formattedAfterWeight: String {
        formatWeight(afterWeight)
    }

    var formattedLiveWeight: String {
        formatWeight(liveWeight)
    }

    var formattedPackageWeight: String {
        guard let totalWeight, let afterWeight else { return "-- g" }
        return formatWeight(max(totalWeight - afterWeight, 0))
    }

    var formattedRemovedWeight: String {
        String(format: "%.1f g", removedWeight)
    }

    var formattedFeeling: String {
        switch feelingValue {
        case ..<0.2:
            return "Unhappy"
        case ..<0.4:
            return "Slightly unhappy"
        case ..<0.6:
            return "Neutral"
        case ..<0.8:
            return "Happy"
        default:
            return "Very happy"
        }
    }

    var receiptSummary: String {
        """
        STUDIO III RECEIPT
        ------------------
        Receipt: \(receiptCode)
        Initial weight: \(formattedTotalWeight)
        Final weight: \(formattedAfterWeight)
        Removed packaging: \(formattedRemovedWeight)
        Feeling: \(formattedFeeling)
        """
    }

    var qrPayload: String {
        """
        STUDIO III DIGITAL COPY
        -----------------------
        \(receiptSummary)
        """
    }

    func resetSession() {
        stopLivePreview()
        totalWeight = nil
        beforeWeight = nil
        afterWeight = nil
        liveWeight = nil
        feelingValue = 0.5
        selectedOutput = .receipt
        statusText = "Ready"
        lastOutputText = ""
        receiptCode = Self.makeReceiptCode()
    }

    func startLivePreview(phase: WeightCapturePhase) {
        stopLivePreview()
        switch phase {
        case .before:
            onRequestBeforeWeight?()
        case .after:
            onRequestAfterWeight?()
        }
        liveWeight = currentWeightValue(for: phase)
        statusText = "Live reading"

        liveWeightTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                guard !Task.isCancelled else { break }
                await MainActor.run {
                    self?.updateLiveWeight(for: phase)
                }
            }
        }
    }

    func stopLivePreview() {
        liveWeightTask?.cancel()
        liveWeightTask = nil
    }

    func captureCurrentWeight(phase: WeightCapturePhase) {
        let weight = liveWeight ?? currentWeightValue(for: phase)

        switch phase {
        case .before:
            totalWeight = weight
            beforeWeight = weight
            statusText = "Initial weight captured"
        case .after:
            afterWeight = weight
            statusText = "Final weight captured"
        }
    }

    func receiveWeight(_ grams: Double, phase: WeightCapturePhase) {
        switch phase {
        case .before:
            totalWeight = grams
            beforeWeight = grams
            statusText = "Initial weight received"
        case .after:
            afterWeight = grams
            statusText = "Final weight received"
        }
    }

    func performSelectedOutput() {
        let payload = receiptSummary

        switch selectedOutput {
        case .receipt:
            lastOutputText = payload
            statusText = "Receipt prepared"
        case .digitalCopy:
            lastOutputText = qrPayload
            if let onShowQRCode {
                onShowQRCode(qrPayload)
            }
            if let onSendDigitalCopy {
                onSendDigitalCopy(qrPayload)
            }
            statusText = "Digital copy prepared"
        }
    }

    private func updateLiveWeight(for phase: WeightCapturePhase) {
        liveWeight = currentWeightValue(for: phase)
    }

    private func currentWeightValue(for phase: WeightCapturePhase) -> Double {
        switch phase {
        case .before:
            return Double.random(in: 620...1260)
        case .after:
            let base = beforeWeight ?? Double.random(in: 620...1260)
            return max(base - Double.random(in: 120...440), 80)
        }
    }

    private func formatWeight(_ value: Double?) -> String {
        guard let value else { return "-- g" }
        return String(format: "%.1f g", value)
    }

    private static func makeReceiptCode() -> String {
        let number = Int.random(in: 1000...9999)
        return "RX-\(number)"
    }
}
