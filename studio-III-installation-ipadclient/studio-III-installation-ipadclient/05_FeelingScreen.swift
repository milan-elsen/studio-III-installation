import SwiftUI

struct Step5FeelingScreen: View {
    let minHeight: CGFloat
    @Binding var feelingValue: Double
    let packageWeightText: String
    let totalWeightText: String
    let productWeightText: String
    let backAction: () -> Void
    let nextAction: () -> Void

    private var feelingAccent: JourneyAccent {
        switch feelingValue {
        case ..<0.25:
            return .danger
        case ..<0.5:
            return .warning
        case ..<0.75:
            return .neutral
        case ..<0.9:
            return .happy
        default:
            return .veryHappy
        }
    }

    private var feelingToneColor: Color {
        switch feelingValue {
        case ..<0.25:
            return JourneyAccent.danger.labelColor
        case ..<0.5:
            return JourneyAccent.warning.labelColor
        case ..<0.75:
            return JourneyAccent.neutral.labelColor
        case ..<0.9:
            return JourneyAccent.happy.labelColor
        default:
            return JourneyAccent.veryHappy.labelColor
        }
    }

    private var feelingLabel: String {
        switch feelingValue {
        case ..<0.25:
            return "Unhappy"
        case ..<0.5:
            return "Slightly unhappy"
        case ..<0.75:
            return "Neutral"
        case ..<0.9:
            return "Happy"
        default:
            return "Very happy"
        }
    }

    var body: some View {
            JourneyScreenShell(fixedHeight: minHeight, accent: feelingAccent) {
            JourneyFeatureCard(accent: feelingAccent) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyMoodFaceOrb(mood: feelingValue, accent: feelingAccent, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Feeling")
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text("How do you feel about the package waste?")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("Slide from unhappy to very happy.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
            }
            
            JourneyFeatureCard(accent: feelingAccent) {
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        HStack(spacing: 8) {
                            Text("😞")
                            Text("Unhappy")
                        }
                        Spacer()
                        HStack(spacing: 8) {
                            Text("Very happy")
                            Text("😄")
                        }
                    }
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(.secondary)
                    .grayscale(1)

                    Slider(value: $feelingValue, in: 0...1)
                        .tint(feelingToneColor)

                    HStack {
                        Text("Current feeling")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text(feelingLabel)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(feelingToneColor)
                    }
                }
            }

            Spacer()
            
            JourneyWeightPyramid(
                packageWeightText: packageWeightText,
                totalWeightText: totalWeightText,
                productWeightText: productWeightText,
                accent: feelingAccent
            )
        } footer: {
            HStack {
                AquaButton(title: "Back", action: backAction)
                AquaButton(title: "Next Step", action: nextAction)
            }
        }
    }
}

#if DEBUG
struct Step5FeelingScreen_Previews: PreviewProvider {
    static var previews: some View {
        Step5FeelingScreen(
            minHeight: JourneyLayout.screenMinHeight,
            feelingValue: .constant(0.7),
            packageWeightText: "736.4 g",
            totalWeightText: "742.0 g",
            productWeightText: "5.6 g",
            backAction: {},
            nextAction: {}
        )
        .padding()
    }
}
#endif
