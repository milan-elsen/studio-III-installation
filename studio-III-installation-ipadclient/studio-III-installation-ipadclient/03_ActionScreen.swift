import SwiftUI

struct Step3ActionScreen: View {
    let minHeight: CGFloat
    let title: String
    let instruction: String
    let iconName: String
    let accent: JourneyAccent
    let packageWeightText: String
    let totalWeightText: String
    let productWeightText: String
    let backAction: () -> Void
    let nextAction: () -> Void

    init(
        minHeight: CGFloat,
        title: String,
        instruction: String,
        iconName: String,
        accent: JourneyAccent,
        packageWeightText: String = "-- g",
        totalWeightText: String = "-- g",
        productWeightText: String = "-- g",
        backAction: @escaping () -> Void,
        nextAction: @escaping () -> Void
    ) {
        self.minHeight = minHeight
        self.title = title
        self.instruction = instruction
        self.iconName = iconName
        self.accent = accent
        self.packageWeightText = packageWeightText
        self.totalWeightText = totalWeightText
        self.productWeightText = productWeightText
        self.backAction = backAction
        self.nextAction = nextAction
    }

    var body: some View {
        JourneyScreenShell(fixedHeight: minHeight, accent: accent) {
            JourneyFeatureCard(accent: accent) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyIconOrb(systemImage: iconName, accent: accent, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(title)
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text(instruction)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("Use the tools provided to unpack and sort the waste.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()
            
            JourneyWeightPyramid(
                packageWeightText: packageWeightText,
                totalWeightText: totalWeightText,
                productWeightText: productWeightText,
                accent: accent
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
struct Step3ActionScreen_Previews: PreviewProvider {
    static var previews: some View {
        Step3ActionScreen(
            minHeight: JourneyLayout.screenMinHeight,
            title: "Unpack and Sort Materials",
            instruction: "Remove the packaging and sort the waste into the material groups.",
            iconName: "shippingbox.fill",
            accent: .process,
            packageWeightText: "Pending",
            backAction: {},
            nextAction: {}
        )
        .padding()
    }
}
#endif
