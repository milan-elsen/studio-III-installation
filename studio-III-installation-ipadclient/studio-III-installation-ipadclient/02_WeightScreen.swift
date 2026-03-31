import SwiftUI

struct Step2WeightScreen: View {
    let minHeight: CGFloat
    let title: String
    let instruction: String
    let liveWeightText: String
    let statusText: String
    let packageWeightText: String
    let totalWeightText: String
    let productWeightText: String
    let backAction: () -> Void
    let onAppearAction: () -> Void
    let onDisappearAction: () -> Void
    let nextAction: () -> Void

    init(
        minHeight: CGFloat,
        title: String,
        instruction: String,
        liveWeightText: String,
        statusText: String,
        packageWeightText: String = "-- g",
        totalWeightText: String = "-- g",
        productWeightText: String = "-- g",
        backAction: @escaping () -> Void,
        onAppearAction: @escaping () -> Void,
        onDisappearAction: @escaping () -> Void,
        nextAction: @escaping () -> Void
    ) {
        self.minHeight = minHeight
        self.title = title
        self.instruction = instruction
        self.liveWeightText = liveWeightText
        self.statusText = statusText
        self.packageWeightText = packageWeightText
        self.totalWeightText = totalWeightText
        self.productWeightText = productWeightText
        self.backAction = backAction
        self.onAppearAction = onAppearAction
        self.onDisappearAction = onDisappearAction
        self.nextAction = nextAction
    }

    var body: some View {
        JourneyScreenShell(fixedHeight: minHeight, accent: .process) {
            JourneyFeatureCard(accent: .process) {
                HStack(alignment: .center, spacing: 16) {
                    JourneyIconOrb(systemImage: "scalemass", accent: .process, size: 84)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(title)
                            .font(.system(size: 22, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.primaryText)

                        Text(instruction)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(Color.primaryText)

                        Text("Live value")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Color.secondary)

                        Text(liveWeightText)
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.aquaText)
                    }
                }
            }
            
            Spacer()
            
            JourneyWeightPyramid(
                packageWeightText: packageWeightText,
                totalWeightText: totalWeightText,
                productWeightText: productWeightText,
                accent: .process
            )

        } footer: {
            HStack {
                AquaButton(title: "Back", action: backAction)
                AquaButton(title: "Next", action: nextAction)
            }
        }
        .onAppear(perform: onAppearAction)
        .onDisappear(perform: onDisappearAction)
    }
}

#if DEBUG
struct Step2WeightScreen_Previews: PreviewProvider {
    static var previews: some View {
        Step2WeightScreen(
            minHeight: JourneyLayout.screenMinHeight,
            title: "Weigh Again",
            instruction: "Measure the package contents.",
            liveWeightText: "736.4 g",
            statusText: "Live reading",
            packageWeightText: "736.4 g",
            totalWeightText: "742.0 g",
            productWeightText: "5.6 g",
            backAction: {},
            onAppearAction: {},
            onDisappearAction: {},
            nextAction: {}
        )
        .padding()
    }
}
#endif
