import SwiftUI

struct Step6OutputScreen: View {
    let minHeight: CGFloat
    @Binding var selectedOutput: JourneyOutputChoice
    let backAction: () -> Void
    let nextAction: () -> Void

    var body: some View {
        JourneyScreenShell(fixedHeight: minHeight, accent: .output) {
            JourneyFeatureCard(accent: .output) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyIconOrb(systemImage: "printer.fill", accent: .output, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Choose Output")
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text("Pick how the digital version should be delivered.")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("The QR code and digital copy are the same output for the phone handoff.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            VStack(spacing: 12) {
                ForEach(JourneyOutputChoice.allCases) { choice in
                    ChoiceButton(
                        title: choice.rawValue,
                        systemImage: choice.symbolName,
                        isSelected: selectedOutput == choice
                    ) {
                        selectedOutput = choice
                    }
                }
            }
        } footer: {
            HStack {
                AquaButton(title: "Back", action: backAction)
                AquaButton(title: "Generate", action: nextAction)
            }
        }
    }
}

#if DEBUG
struct Step6OutputScreen_Previews: PreviewProvider {
    static var previews: some View {
        Step6OutputScreen(
            minHeight: JourneyLayout.screenMinHeight,
            selectedOutput: .constant(.digitalCopy),
            backAction: {},
            nextAction: {}
        )
        .padding()
    }
}
#endif
