import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadius, Colors, Fonts, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface InstructionSectionProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  children: React.ReactNode;
}

function InstructionSection({ icon, title, children }: InstructionSectionProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.cardSurface }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? "#312E81" : "#EEF2FF" }]}>
        <Feather name={icon} size={22} color={isDark ? "#A5B4FC" : Colors.light.primary} />
      </View>
      <View style={styles.sectionBody}>
        <ThemedText style={[styles.sectionTitle, { fontFamily: Fonts.displaySemiBold }]}>
          {title}
        </ThemedText>
        {children}
      </View>
    </View>
  );
}

export default function HowToPlayScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.xl,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={[styles.introIcon, { backgroundColor: theme.primary }]}>
            <Feather name="help-circle" size={34} color="#FFFFFF" />
          </View>
          <ThemedText style={[styles.title, { fontFamily: Fonts.display }]}>
            How to Play
          </ThemedText>
          <ThemedText style={[styles.subtitle, { fontFamily: Fonts.body }]}>
            Clear the color cascade by turning every cell black.
          </ThemedText>
        </View>

        <View style={styles.sections}>
          <InstructionSection icon="target" title="Your goal">
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              Turn every cell on the board black. When all the cells are black, the level is complete.
            </ThemedText>
          </InstructionSection>

          <InstructionSection icon="mouse-pointer" title="Make a move">
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              Tap any cell to change its color. The cell you tap and the cells directly above, below,
              left, and right of it change together.
            </ThemedText>
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              Every tap counts as one move. Watch the Moves Remaining counter at the top of the game.
            </ThemedText>
          </InstructionSection>

          <InstructionSection icon="tool" title="Use your tools">
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              Undo takes back your most recent move and gives that move back. You can use it once
              after each move.
            </ThemedText>
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              Reset starts the current level over with a new board. Resetting does not cost a life.
            </ThemedText>
          </InstructionSection>

          <InstructionSection icon="heart" title="Lives and progress">
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              You have 10 lives. If you run out of moves before solving a level, you lose one life.
            </ThemedText>
            <ThemedText style={[styles.bodyText, { fontFamily: Fonts.body }]}>
              You can try the level again or return home. Solve a level to move forward through the
              cascade.
            </ThemedText>
          </InstructionSection>

          <View style={[styles.tipCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="info" size={20} color={theme.primary} />
            <ThemedText style={[styles.tipText, { fontFamily: Fonts.bodyMedium }]}>
              Think ahead: one tap can change up to five cells, so look at the surrounding colors
              before you move.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  intro: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  introIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    maxWidth: 320,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  sections: {
    gap: Spacing.md,
  },
  section: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 19,
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.78,
    marginBottom: Spacing.sm,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});