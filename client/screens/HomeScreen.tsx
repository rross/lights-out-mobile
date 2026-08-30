import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getCurrentLevel, getCompletedLevels, getSettings } from "@/utils/storage";
import { TOTAL_LEVELS } from "@/utils/gameLogic";
import appIcon from "../../assets/images/icon.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const playButtonScale = useSharedValue(1);

  useEffect(() => {
    loadProgress();
    const unsubscribe = navigation.addListener("focus", loadProgress);
    return unsubscribe;
  }, [navigation]);

  async function loadProgress() {
    const level = await getCurrentLevel();
    const completed = await getCompletedLevels();
    const settings = await getSettings();
    setCurrentLevel(level);
    setCompletedCount(completed.size);
    setHapticEnabled(settings.hapticEnabled);
  }

  function handlePlayPress() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    playButtonScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    navigation.navigate("Game", { level: currentLevel });
  }

  function handleLevelSelectPress() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("LevelSelect");
  }

  function handleSettingsPress() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Settings");
  }

  function handleHowToPlayPress() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("HowToPlay");
  }

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  const gradientColors = isDark
    ? ["#1F2937", "#111827"] as const
    : ["#EEF2FF", "#F8F9FA"] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing["3xl"] }]}>
        <Pressable
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          hitSlop={12}
          testID="button-settings"
        >
          <Feather
            name="settings"
            size={24}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
        </Pressable>

        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.header}>
          <Image source={appIcon} style={styles.appIcon} />
          <ThemedText style={[styles.title, { fontFamily: Fonts.display }]}>
            Color Cascade
          </ThemedText>
          <ThemedText style={[styles.subtitle, { fontFamily: Fonts.body }]}>
            Turn all cells black to win
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.centerContent}>
          <AnimatedPressable
            style={[styles.playButton, playButtonAnimatedStyle]}
            onPress={handlePlayPress}
            testID="button-play"
          >
            <LinearGradient
              colors={["#6366F1", "#4F46E5"]}
              style={styles.playButtonGradient}
            >
              <Feather name="play" size={32} color="#FFFFFF" />
              <ThemedText style={styles.playButtonText}>Play</ThemedText>
            </LinearGradient>
          </AnimatedPressable>

          <Pressable
            style={styles.levelSelectButton}
            onPress={handleLevelSelectPress}
            testID="button-level-select"
          >
            <ThemedText style={[styles.levelSelectText, { color: isDark ? Colors.dark.primary : Colors.light.primary }]}>
              Select Level
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.howToPlayButton}
            onPress={handleHowToPlayPress}
            testID="button-how-to-play"
          >
            <Feather
              name="book-open"
              size={18}
              color={isDark ? Colors.dark.primary : Colors.light.primary}
            />
            <ThemedText
              style={[
                styles.howToPlayText,
                { color: isDark ? Colors.dark.primary : Colors.light.primary },
              ]}
            >
              How to Play
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(600)} style={[styles.progressContainer, { marginBottom: insets.bottom + Spacing["2xl"] }]}>
          <View style={[styles.progressCard, { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface }]}>
            <ThemedText style={[styles.progressLabel, { fontFamily: Fonts.bodyMedium }]}>
              Current Level
            </ThemedText>
            <ThemedText style={[styles.progressValue, { fontFamily: Fonts.displaySemiBold, color: isDark ? Colors.dark.primary : Colors.light.primary }]}>
              {currentLevel}
            </ThemedText>
          </View>
          <View style={[styles.progressCard, { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface }]}>
            <ThemedText style={[styles.progressLabel, { fontFamily: Fonts.bodyMedium }]}>
              Completed
            </ThemedText>
            <ThemedText style={[styles.progressValue, { fontFamily: Fonts.displaySemiBold, color: isDark ? Colors.dark.success : Colors.light.success }]}>
              {completedCount}/{TOTAL_LEVELS}
            </ThemedText>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  settingsButton: {
    position: "absolute",
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  header: {
    alignItems: "center",
    marginTop: Spacing["4xl"],
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  playButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["4xl"],
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Fonts.displaySemiBold,
  },
  levelSelectButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  levelSelectText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.bodyMedium,
  },
  howToPlayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  howToPlayText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.bodyMedium,
  },
  progressContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  progressCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  progressLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: Spacing.xs,
  },
  progressValue: {
    fontSize: 24,
  },
});
