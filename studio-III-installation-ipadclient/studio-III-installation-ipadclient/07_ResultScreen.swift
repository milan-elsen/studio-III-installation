import SwiftUI

struct Step7ResultScreen: View {
    let minHeight: CGFloat
    let removedWeight: String
    let beforeWeight: String
    let afterWeight: String
    let feelingText: String
    let restartAction: () -> Void
    let printAction: () -> Void

    var body: some View {
        JourneyScreenShell(fixedHeight: minHeight, accent: .reflection) {
            JourneyFeatureCard(accent: .reflection) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyIconOrb(systemImage: "leaf.fill", accent: .reflection, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Reflection & Output")
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text("Waste becomes visible.")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("This screen summarizes the before and after state.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            JourneyFeatureCard(accent: .reflection) {
                VStack(alignment: .leading, spacing: 14) {
                    Text("Packaging material")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.secondary)

                    HStack(alignment: .firstTextBaseline, spacing: 10) {
                        Text(removedWeight)
                            .font(.system(size: 38, weight: .bold, design: .rounded))
                            .foregroundStyle(Color(hex: "216E42"))
                            .minimumScaleFactor(0.8)

                        Text("removed from the package")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }

                    Text("This is the value to focus on when comparing the package overhead.")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(Color.primaryText)
                }
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.98), Color(hex: "DFF3E4").opacity(0.96)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 22, style: .continuous)
                                .stroke(Color.white.opacity(0.96), lineWidth: 1)
                        )
                        .shadow(color: Color(hex: "90DAA0").opacity(0.22), radius: 12, x: 0, y: 6)
                )
            }

            HStack(spacing: 14) {
                JourneyStatCard(title: "Initial weight", value: beforeWeight, accent: .reflection)
                JourneyStatCard(title: "Final weight", value: afterWeight, accent: .reflection)
            }

            JourneyFeatureCard(accent: .reflection) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Was this necessary?")
                        .font(.system(size: 20, weight: .semibold))

                    Text("Feeling about the package waste: \(feelingText)")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(Color.primaryText)
                }
            }
        } footer: {
            HStack {
                AquaButton(title: "Restart", action: restartAction)
                AquaButton(title: "Print", action: printAction)
            }
        }
    }
}

#if DEBUG
struct Step7ResultScreen_Previews: PreviewProvider {
    static var previews: some View {
        ZStack {
            JourneyBackdrop()
            Step7ResultScreen(
                minHeight: JourneyLayout.screenMinHeight,
                removedWeight: "282.0 g",
                beforeWeight: "1,024.0 g",
                afterWeight: "742.0 g",
                feelingText: "Happy",
                restartAction: {},
                printAction: {}
            )
            .padding()
        }
    }
}
#endif
