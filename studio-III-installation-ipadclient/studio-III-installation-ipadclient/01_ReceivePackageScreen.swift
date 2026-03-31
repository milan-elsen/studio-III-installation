import SwiftUI

struct Step1ReceivePackageScreen: View {
    let minHeight: CGFloat
    let nextAction: () -> Void

    var body: some View {
        JourneyScreenShell(fixedHeight: minHeight, accent: .arrival) {
            JourneyFeatureCard(accent: .arrival) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyIconOrb(systemImage: "shippingbox.fill", accent: .arrival, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Welcome")
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text("Place your package on the scale to start unpacking.")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("For now, use the button below to simulate the hardware trigger.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            JourneyFeatureCard(accent: .arrival) {
                HStack(alignment: .center, spacing: 12) {
                    JourneyIconOrb(systemImage: "info.circle.fill", accent: .arrival, size: 44)

                    Text("The process will start automatically once something is placed on the scale.")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(Color.primaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        } footer: {
            AquaButton(title: "Start (Development Simulation)", action: nextAction)
        }
    }
}

#if DEBUG
struct Step1ReceivePackageScreen_Previews: PreviewProvider {
    static var previews: some View {
        Step1ReceivePackageScreen(minHeight: JourneyLayout.screenMinHeight, nextAction: {})
            .padding()
    }
}
#endif
