import SwiftUI

enum JourneyLayout {
    static let screenMinHeight: CGFloat = 520
}

enum JourneyAccent {
    case arrival
    case process
    case reflection
    case output
    case neutral
    case danger
    case warning
    case success
    case happy
    case veryHappy
    
    var labelColor: Color {
        switch self {
        case .arrival:
            return Color(hex: "7A6B2D")
        case .process:
            return Color(hex: "1F4C73")
        case .reflection:
            return Color(hex: "216E42")
        case .output:
            return Color(hex: "355C8E")
        case .neutral:
            return Color(hex: "4E6A84")
        case .danger:
            return Color(hex: "B24A3B")
        case .warning:
            return Color(hex: "C28D17")
        case .success:
            return Color(hex: "2E8B57")
        case .happy:
            return Color(hex: "63BF77")
        case .veryHappy:
            return Color(hex: "1F7D43")
        }
    }
    
    var surfaceColors: [Color] {
        switch self {
        case .arrival:
            return [Color(hex: "FFFDF2"), Color(hex: "F4E6B8")]
        case .process:
            return [Color(hex: "FBFEFF"), Color(hex: "DDEFF8")]
        case .reflection:
            return [Color(hex: "F4FFF4"), Color(hex: "D7F2D9")]
        case .output:
            return [Color(hex: "F9FBFF"), Color(hex: "DDE9FA")]
        case .neutral:
            return [Color(hex: "FBFCFD"), Color(hex: "E8EEF3")]
        case .danger:
            return [Color(hex: "FFF7F4"), Color(hex: "F4D4CC")]
        case .warning:
            return [Color(hex: "FFFBEF"), Color(hex: "F5E1A9")]
        case .success:
            return [Color(hex: "F2FFF2"), Color(hex: "D8F0D8")]
        case .happy:
            return [Color(hex: "F4FFF6"), Color(hex: "D9F3DE")]
        case .veryHappy:
            return [Color(hex: "E7F8E9"), Color(hex: "BEE2C4")]
        }
    }
    
    var glowColor: Color {
        switch self {
        case .arrival:
            return Color(hex: "D9C66A")
        case .process:
            return Color(hex: "8BC4EC")
        case .reflection:
            return Color(hex: "92D59A")
        case .output:
            return Color(hex: "98BEE7")
        case .neutral:
            return Color(hex: "B7C9D8")
        case .danger:
            return Color(hex: "E18B82")
        case .warning:
            return Color(hex: "E3C15C")
        case .success:
            return Color(hex: "7DCE92")
        case .happy:
            return Color(hex: "90DAA0")
        case .veryHappy:
            return Color(hex: "3EA95F")
        }
    }
    
    var symbolName: String {
        switch self {
        case .arrival:
            return "shippingbox.fill"
        case .process:
            return "scalemass"
        case .reflection:
            return "leaf.fill"
        case .output:
            return "printer.fill"
        case .neutral:
            return "sparkles"
        case .danger:
            return "exclamationmark.triangle.fill"
        case .warning:
            return "minus.circle.fill"
        case .success:
            return "checkmark.seal.fill"
        case .happy:
            return "face.smiling.fill"
        case .veryHappy:
            return "sun.max.fill"
        }
    }
}

struct JourneyBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(hex: "FCFEFF"),
                    Color(hex: "EDF7FA"),
                    Color(hex: "DAECF2"),
                    Color(hex: "D0E8D6")
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            Circle()
                .fill(Color(hex: "9ED3F2").opacity(0.30))
                .frame(width: 440, height: 440)
                .blur(radius: 60)
                .offset(x: -260, y: -250)
            
            Circle()
                .fill(Color(hex: "B8E4BE").opacity(0.28))
                .frame(width: 560, height: 560)
                .blur(radius: 72)
                .offset(x: 240, y: 280)
        }
    }
}

struct JourneyIconOrb: View {
    let systemImage: String
    let accent: JourneyAccent
    var size: CGFloat = 74
    
    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.98), accent.glowColor.opacity(0.58)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.95), lineWidth: 1)
                )
                .shadow(color: accent.glowColor.opacity(0.28), radius: 12, x: 0, y: 5)
            
            Image(systemName: systemImage)
                .font(.system(size: size * 0.38, weight: .semibold))
                .foregroundStyle(accent.labelColor)
        }
        .frame(width: size, height: size)
    }
}

struct JourneyMoodFaceOrb: View {
    let mood: Double
    let accent: JourneyAccent
    var size: CGFloat = 84

    private var glyph: String {
        switch mood {
        case ..<0.25:
            return "😞"
        case ..<0.5:
            return "😕"
        case ..<0.75:
            return "😐"
        case ..<0.9:
            return "🙂"
        default:
            return "😄"
        }
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.98), accent.glowColor.opacity(0.58)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.95), lineWidth: 1)
                )
                .shadow(color: accent.glowColor.opacity(0.28), radius: 12, x: 0, y: 5)

            Text(glyph)
                .font(.system(size: size * 0.42, weight: .regular, design: .rounded))
                .foregroundStyle(accent.labelColor)
                .opacity(0.95)
                .grayscale(1)
        }
        .frame(width: size, height: size)
    }
}

struct JourneyStatCard: View {
    let title: String
    let value: String
    let accent: JourneyAccent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(.secondary)
            
            Text(value)
                .font(.system(size: 26, weight: .semibold, design: .rounded))
                .foregroundStyle(accent.labelColor)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.92), accent.surfaceColors.last!.opacity(0.92)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.white.opacity(0.95), lineWidth: 1)
                )
                .shadow(color: accent.glowColor.opacity(0.18), radius: 10, x: 0, y: 5)
        )
    }
}

struct JourneyPyramidCell: View {
    let title: String
    let value: String
    let accent: JourneyAccent
    var isPrimary: Bool = false
    
    private var isPlaceholder: Bool {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty || trimmed == "-- g"
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: isPrimary ? 15 : 12, weight: .semibold))
                .foregroundStyle(.secondary)
            
            Text(value)
                .font(.system(size: isPrimary ? 26 : 18, weight: .bold, design: .rounded))
                .foregroundStyle(accent.labelColor)
                .lineLimit(1)
                .minimumScaleFactor(isPrimary ? 0.78 : 0.85)
        }
        .frame(maxWidth: .infinity, minHeight: isPrimary ? 96 : 58, alignment: .leading)
        .padding(isPrimary ? 16 : 9)
        .opacity(isPlaceholder ? 0.30 : (isPrimary ? 1.0 : 0.88))
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.95), accent.surfaceColors.last!.opacity(0.9)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.white.opacity(0.92), lineWidth: 1)
                )
                .shadow(color: accent.glowColor.opacity(0.16), radius: 8, x: 0, y: 4)
        )
    }
}

struct JourneyWeightPyramid: View {
    let packageWeightText: String
    let totalWeightText: String
    let productWeightText: String?
    let accent: JourneyAccent
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Spacer()
                JourneyPyramidCell(title: "Packaging Material Weight", value: packageWeightText, accent: accent, isPrimary: true)
                    .frame(maxWidth: 360)
                Spacer()
            }
            
            HStack(spacing: 8) {
                JourneyPyramidCell(title: "Total weight", value: totalWeightText, accent: accent)
                JourneyPyramidCell(title: "Product weight", value: productWeightText ?? "-- g", accent: accent)
            }
        }
    }
}

struct JourneyFeatureCard<Content: View>: View {
    let accent: JourneyAccent
    let content: Content
    
    init(accent: JourneyAccent, @ViewBuilder content: () -> Content) {
        self.accent = accent
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: accent.surfaceColors.map { $0.opacity(0.96) },
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(Color.white.opacity(0.90), lineWidth: 1)
                )
                .shadow(color: accent.glowColor.opacity(0.18), radius: 14, x: 0, y: 7)
        )
    }
}

struct JourneyPanel<Content: View>: View {
    let accent: JourneyAccent
    let content: Content
    
    init(accent: JourneyAccent = .neutral, @ViewBuilder content: () -> Content) {
        self.accent = accent
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 16) {
                content
            }
            .padding(22)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: accent.surfaceColors.map { $0.opacity(0.96) },
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 28, style: .continuous)
                            .stroke(Color.white.opacity(0.92), lineWidth: 1.2)
                    )
                    .shadow(color: accent.glowColor.opacity(0.25), radius: 18, x: 0, y: 8)
            )
        }
    }
}

struct JourneyScreenShell<Content: View, Footer: View>: View {
    let fixedHeight: CGFloat
    let accent: JourneyAccent
    let content: Content
    let footer: Footer
    
    init(
        fixedHeight: CGFloat = JourneyLayout.screenMinHeight,
        accent: JourneyAccent = .neutral,
        @ViewBuilder content: () -> Content,
        @ViewBuilder footer: () -> Footer
    ) {
        self.fixedHeight = fixedHeight
        self.accent = accent
        self.content = content()
        self.footer = footer()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            JourneyPanel(accent: accent) {
                VStack(alignment: .leading, spacing: 16) {
                    content
                }
                .frame(height: fixedHeight, alignment: .topLeading)
            }
            
            footer
        }
    }
}

struct AquaButton: View {
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(Color.aquaText)
                .frame(maxWidth: .infinity, minHeight: 48)
                .contentShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.aquaTop, Color.aquaMidTop, Color.aquaMidBottom, Color.aquaBottom],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.aquaBorder, lineWidth: 1)
                )
                .shadow(color: Color.aquaShadow.opacity(0.25), radius: 4, x: 0, y: 2)
        )
    }
}

struct ChoiceButton: View {
    let title: String
    let systemImage: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                JourneyIconOrb(systemImage: systemImage, accent: isSelected ? .output : .neutral, size: 36)
                
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(isSelected ? Color.aquaText : Color.secondary.opacity(0.65))
            }
            .foregroundStyle(isSelected ? Color.aquaText : Color.primaryText)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity, minHeight: 58)
            .contentShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: isSelected
                        ? [Color.white.opacity(0.97), Color(hex: "DDF0FB").opacity(0.92)]
                        : [Color.white.opacity(0.88), Color(hex: "E8F2F7").opacity(0.88)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(isSelected ? Color.aquaBorder : Color.white.opacity(0.75), lineWidth: 1)
                )
                .shadow(color: isSelected ? Color.aquaShadow.opacity(0.22) : Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
        )
    }
}

struct MetricRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundStyle(Color.aquaText)
        }
        .font(.system(size: 17, weight: .semibold))
    }
}

extension Color {
    static let primaryText = Color(hex: "111111")
    static let aquaTop = Color(hex: "FCFEFF")
    static let aquaMidTop = Color(hex: "EEF8FE")
    static let aquaMidBottom = Color(hex: "DCECF6")
    static let aquaBottom = Color(hex: "C6DAEA")
    static let aquaBorder = Color(hex: "B7C9D8")
    static let aquaShadow = Color(hex: "8EA0B2")
    static let aquaText = Color(hex: "1F4C73")
    
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        
        let red, green, blue, alpha: Double
        switch cleaned.count {
        case 6:
            red = Double((value & 0xFF0000) >> 16) / 255
            green = Double((value & 0x00FF00) >> 8) / 255
            blue = Double(value & 0x0000FF) / 255
            alpha = 1
        case 8:
            red = Double((value & 0xFF000000) >> 24) / 255
            green = Double((value & 0x00FF0000) >> 16) / 255
            blue = Double((value & 0x0000FF00) >> 8) / 255
            alpha = Double(value & 0x000000FF) / 255
        default:
            red = 1
            green = 1
            blue = 1
            alpha = 1
        }
        
        self.init(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }
}

#if DEBUG
struct JourneyBackdrop_Previews: PreviewProvider {
    static var previews: some View {
        JourneyBackdrop().ignoresSafeArea()
    }
}
#endif
