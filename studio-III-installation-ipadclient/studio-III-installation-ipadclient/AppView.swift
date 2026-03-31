import SwiftUI

enum JourneyStep: Int, CaseIterable {
    case receivePackage
    case beforeWeight
    case unpack
    case afterWeight
    case feeling
    case output
    case result

    var title: String {
        switch self {
        case .receivePackage: "Welcome!"
        case .beforeWeight: "Weigh Your Packed Package"
        case .unpack: "Unpack and Sort Materials"
        case .afterWeight: "Weigh Again"
        case .feeling: "Input Feeling"
        case .output: "Choose Output"
        case .result: "Reflection & Output"
        }
    }

    var subtitle: String {
        switch self {
        case .receivePackage: "Start the packaging reduction workflow."
        case .beforeWeight: "Let’s capture the initial package weight."
        case .unpack: "Remove the packaging and sort the waste into the material groups."
        case .afterWeight: "Thise time measure just the content of your package."
        case .feeling: "Write a short reflection about the experience."
        case .output: "Pick how the result should be delivered."
        case .result: "Review the reduction and the selected output."
        }
    }

    var accent: JourneyAccent {
        switch self {
        case .receivePackage:
            return .arrival
        case .beforeWeight, .unpack, .afterWeight:
            return .process
        case .feeling, .result:
            return .reflection
        case .output:
            return .output
        }
    }
}

struct AppView: View {
    @StateObject private var model: JourneyFlowViewModel
    @State private var step: JourneyStep = .receivePackage
    @State private var isShowingPrintPreview = false
    @State private var printPreviewReceipt = ""
    private let onPrintReceipt: ((String) -> Void)?

    init(
        onRequestBeforeWeight: (() -> Void)? = nil,
        onRequestAfterWeight: (() -> Void)? = nil,
        onPrintReceipt: ((String) -> Void)? = nil,
        onShowQRCode: ((String) -> Void)? = nil,
        onSendDigitalCopy: ((String) -> Void)? = nil
    ) {
        _model = StateObject(
            wrappedValue: JourneyFlowViewModel(
                onRequestBeforeWeight: onRequestBeforeWeight,
                onRequestAfterWeight: onRequestAfterWeight,
                onPrintReceipt: onPrintReceipt,
                onShowQRCode: onShowQRCode,
                onSendDigitalCopy: onSendDigitalCopy
            )
        )
        self.onPrintReceipt = onPrintReceipt
    }

    var body: some View {
        NavigationStack {
            ZStack(alignment: Alignment(horizontal: .center,
                                        vertical: .center)) {
                JourneyBackdrop().ignoresSafeArea()

                VStack {
                    VStack(alignment: .leading, spacing: 24) {
                        header
                        Spacer()
                        currentStep
                        Spacer()
                    }
                    .frame(maxWidth: 760, alignment: .leading)
                    .padding(24)
                }
                .onAppear(perform: resetJourney)
            }
            .sheet(isPresented: $isShowingPrintPreview, onDismiss: resetJourney) {
                ReceiptPreviewSheet(receiptText: printPreviewReceipt)
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Interactive Packaging Reduction System")
                        .font(.system(size: 34, weight: .semibold, design: .rounded))
                        .foregroundStyle(Color(hex: "2C6C9B"))

                    Text("Making invisible waste visible through interaction")
                        .font(.system(size: 18, weight: .medium))
                        .italic()
                        .foregroundStyle(Color(hex: "406D91"))
                }
            }

            ProgressView(value: progressValue)
                .tint(Color.aquaText)
                .scaleEffect(y: 1.2, anchor: .center)
        }
    }

    @ViewBuilder
    private var currentStep: some View {
        switch step {
        case .receivePackage:
            Step1ReceivePackageScreen(minHeight: JourneyLayout.screenMinHeight) {
                step = .beforeWeight
            }

        case .beforeWeight:
            liveWeightScreen(
                phase: .before,
                title: step.title,
                instruction: step.subtitle,
                liveWeightText: model.formattedLiveWeight,
                statusText: model.statusText,
                packageWeightText: model.formattedBeforeWeight,
                totalWeightText: model.formattedTotalWeight,
                productWeightText: "-- g",
                backAction: { step = .receivePackage },
                nextAction: {
                    model.captureCurrentWeight(phase: .before)
                    step = .unpack
                }
            )

        case .unpack:
            Step3ActionScreen(
                minHeight: JourneyLayout.screenMinHeight,
                title: step.title,
                instruction: step.subtitle,
                iconName: "shippingbox.fill",
                accent: .process,
                packageWeightText: "-- g",
                totalWeightText: model.formattedTotalWeight,
                productWeightText: "-- g",
                backAction: { step = .beforeWeight },
                nextAction: { step = .afterWeight }
            )

        case .afterWeight:
            liveWeightScreen(
                phase: .after,
                title: step.title,
                instruction: step.subtitle,
                liveWeightText: model.formattedLiveWeight,
                statusText: model.statusText,
                packageWeightText: model.formattedPackageWeight,
                totalWeightText: model.formattedTotalWeight,
                productWeightText: model.formattedAfterWeight,
                backAction: { step = .unpack },
                nextAction: {
                    model.captureCurrentWeight(phase: .after)
                    step = .feeling
                }
            )

        case .feeling:
            Step5FeelingScreen(
                minHeight: JourneyLayout.screenMinHeight,
                feelingValue: $model.feelingValue,
                packageWeightText: model.formattedPackageWeight,
                totalWeightText: model.formattedTotalWeight,
                productWeightText: model.formattedAfterWeight,
                backAction: { step = .afterWeight },
                nextAction: { step = .output }
            )

        case .output:
            Step6OutputScreen(
                minHeight: JourneyLayout.screenMinHeight,
                selectedOutput: Binding(
                    get: { model.selectedOutput },
                    set: { model.selectedOutput = $0 }
                ),
                backAction: { step = .feeling },
                nextAction: {
                    model.performSelectedOutput()
                    step = .result
                }
            )

        case .result:
            Step7ResultScreen(
                minHeight: JourneyLayout.screenMinHeight,
                removedWeight: model.formattedRemovedWeight,
                beforeWeight: model.formattedBeforeWeight,
                afterWeight: model.formattedAfterWeight,
                feelingText: model.formattedFeeling,
                restartAction: { resetJourney() },
                printAction: {
                    if let onPrintReceipt {
                        onPrintReceipt(model.receiptSummary)
                    } else {
                        printPreviewReceipt = model.receiptSummary
                        isShowingPrintPreview = true
                    }
                }
            )
        }
    }

    private var progressValue: Double {
        guard JourneyStep.allCases.count > 1 else { return 0 }
        return Double(step.rawValue) / Double(JourneyStep.allCases.count - 1)
    }

    private func resetJourney() {
        model.resetSession()
        step = .receivePackage
    }

    @ViewBuilder
    private func liveWeightScreen(
        phase: WeightCapturePhase,
        title: String,
        instruction: String,
        liveWeightText: String,
        statusText: String,
        packageWeightText: String,
        totalWeightText: String,
        productWeightText: String,
        backAction: @escaping () -> Void,
        nextAction: @escaping () -> Void
    ) -> some View {
        Step2WeightScreen(
            minHeight: JourneyLayout.screenMinHeight,
            title: title,
            instruction: instruction,
            liveWeightText: liveWeightText,
            statusText: statusText,
            packageWeightText: packageWeightText,
            totalWeightText: totalWeightText,
            productWeightText: productWeightText,
            backAction: backAction,
            onAppearAction: {
                model.startLivePreview(phase: phase)
            },
            onDisappearAction: {
                model.stopLivePreview()
            },
            nextAction: nextAction
        )
    }
}

private struct ReceiptPreviewSheet: View {
    let receiptText: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            JourneyBackdrop().ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    JourneyFeatureCard(accent: .output) {
                        HStack(alignment: .center, spacing: 16) {
                            JourneyIconOrb(systemImage: "printer.fill", accent: .output, size: 84)

                            VStack(alignment: .leading, spacing: 8) {
                                Text("Printed Receipt")
                                    .font(.system(size: 22, weight: .semibold, design: .rounded))
                                    .foregroundStyle(Color.primaryText)

                                Text("This is what will be sent to the thermal printer.")
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundStyle(Color.primaryText)

                                Text("Review the output before closing the sheet.")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }

                    JourneyFeatureCard(accent: .output) {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Receipt Summary")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundStyle(.secondary)

                            Text(receiptText)
                                .font(.system(.body, design: .monospaced))
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(.white.opacity(0.45), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        }
                    }

                    AquaButton(title: "Close", action: { dismiss() })
                }
                .padding(24)
                .frame(maxWidth: 640, alignment: .leading)
            }
        }
    }
}

struct AppView_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            JourneyBackdrop().ignoresSafeArea()
            AppView()
        }
    }
}
