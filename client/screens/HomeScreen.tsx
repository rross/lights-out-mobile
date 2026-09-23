import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Switch,
} from "react-native";
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
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
  Fonts,
  Shadows,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
  getAudioWelcomeCompleted,
  getCurrentLevel,
  getCompletedLevels,
  getSettings,
  saveSettings,
  setAudioWelcomeCompleted,
  type GameSettings,
} from "@/utils/storage";
import { TOTAL_LEVELS } from "@/utils/gameLogic";
import { useBackgroundMusic } from "@/contexts/BackgroundMusicContext";
import Slider from "@react-native-community/slider";
import appIcon from "../../assets/images/icon.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const { activateMusicPreferences } = useBackgroundMusic();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [showAudioWelcome, setShowAudioWelcome] = useState(false);
  const [audioPreferences, setAudioPreferences] = useState<
    Pick<
      GameSettings,
      "musicEnabled" | "musicVolume" | "soundEnabled" | "soundVolume"
    >
  >({
    musicEnabled: false,
    musicVolume: DEFAULT_MUSIC_VOLUME,
    soundEnabled: false,
    soundVolume: DEFAULT_SOUND_VOLUME,
  });

  const playButtonScale = useSharedValue(1);

  async function loadProgress() {
    const level = await getCurrentLevel();
    const completed = await getCompletedLevels();
    const settings = await getSettings();
    setCurrentLevel(level);
    setCompletedCount(completed.size);
    setHapticEnabled(settings.hapticEnabled);
  }

  async function loadAudioWelcome() {
    const completed = await getAudioWelcomeCompleted();
    if (!completed) {
      setShowAudioWelcome(true);
    }
  }

  useEffect(() => {
    // AsyncStorage hydration updates state only after its reads resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProgress();
    void loadAudioWelcome();
    const unsubscribe = navigation.addListener("focus", loadProgress);
    return unsubscribe;
  }, [navigation]);

  function handleAudioToggle(
    key: "musicEnabled" | "soundEnabled",
    value: boolean,
  ) {
    setAudioPreferences((current) => ({ ...current, [key]: value }));
  }

  function handleAudioVolumeChange(
    key: "musicVolume" | "soundVolume",
    value: number,
  ) {
    setAudioPreferences((current) => ({
      ...current,
      [key]: Math.max(0, Math.min(1, value)),
    }));
  }

  async function handleSaveAudioPreferences() {
    const currentSettings = await getSettings();
    const newSettings: GameSettings = {
      ...currentSettings,
      ...audioPreferences,
    };

    await saveSettings(newSettings);
    await setAudioWelcomeCompleted();
    activateMusicPreferences(newSettings.musicEnabled, newSettings.musicVolume);
    setShowAudioWelcome(false);
  }

  function handlePlayPress() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    playButtonScale.value = withSequence(
      withSpring(0.95, { damping: 15 }),
      withSpring(1, { damping: 15 }),
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
    ? (["#1F2937", "#111827"] as const)
    : (["#EEF2FF", "#F8F9FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View
        style={[styles.content, { paddingTop: insets.top + Spacing["3xl"] }]}
      >
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

        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          style={styles.header}
        >
          <Image source={appIcon} style={styles.appIcon} />
          <ThemedText style={[styles.title, { fontFamily: Fonts.display }]}>
            Color Cascade
          </ThemedText>
          <ThemedText style={[styles.subtitle, { fontFamily: Fonts.body }]}>
            Turn all cells black to win
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(300).duration(600)}
          style={styles.centerContent}
        >
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
            <ThemedText
              style={[
                styles.levelSelectText,
                { color: isDark ? Colors.dark.primary : Colors.light.primary },
              ]}
            >
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

        <Animated.View
          entering={FadeIn.delay(500).duration(600)}
          style={[
            styles.progressContainer,
            { marginBottom: insets.bottom + Spacing["2xl"] },
          ]}
        >
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: isDark
                  ? Colors.dark.cardSurface
                  : Colors.light.cardSurface,
              },
            ]}
          >
            <ThemedText
              style={[styles.progressLabel, { fontFamily: Fonts.bodyMedium }]}
            >
              Current Level
            </ThemedText>
            <ThemedText
              style={[
                styles.progressValue,
                {
                  fontFamily: Fonts.displaySemiBold,
                  color: isDark ? Colors.dark.primary : Colors.light.primary,
                },
              ]}
            >
              {currentLevel}
            </ThemedText>
          </View>
          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: isDark
                  ? Colors.dark.cardSurface
                  : Colors.light.cardSurface,
              },
            ]}
          >
            <ThemedText
              style={[styles.progressLabel, { fontFamily: Fonts.bodyMedium }]}
            >
              Completed
            </ThemedText>
            <ThemedText
              style={[
                styles.progressValue,
                {
                  fontFamily: Fonts.displaySemiBold,
                  color: isDark ? Colors.dark.success : Colors.light.success,
                },
              ]}
            >
              {completedCount}/{TOTAL_LEVELS}
            </ThemedText>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={showAudioWelcome}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={styles.audioModalOverlay}>
          <View
            style={[
              styles.audioModalContent,
              {
                backgroundColor: isDark
                  ? Colors.dark.cardSurface
                  : Colors.light.cardSurface,
              },
            ]}
          >
            <View style={styles.audioWelcomeIcon}>
              <Feather name="music" size={28} color="#FFFFFF" />
            </View>

            <ThemedText
              style={[styles.audioModalTitle, { fontFamily: Fonts.display }]}
            >
              Welcome to Color Cascade
            </ThemedText>
            <ThemedText
              style={[styles.audioModalDescription, { fontFamily: Fonts.body }]}
            >
              Choose how you would like the game to sound. You can change these
              preferences anytime in Settings.
            </ThemedText>

            <View style={styles.audioPreferenceGroup}>
              <View style={styles.audioPreferenceHeader}>
                <View style={styles.audioPreferenceLabel}>
                  <Feather
                    name="music"
                    size={20}
                    color={isDark ? Colors.dark.primary : Colors.light.primary}
                  />
                  <ThemedText style={{ fontFamily: Fonts.bodyMedium }}>
                    Music
                  </ThemedText>
                </View>
                <Switch
                  value={audioPreferences.musicEnabled}
                  onValueChange={(value) =>
                    handleAudioToggle("musicEnabled", value)
                  }
                  trackColor={{
                    false: isDark ? Colors.dark.border : Colors.light.border,
                    true: isDark ? Colors.dark.primary : Colors.light.primary,
                  }}
                  thumbColor="#FFFFFF"
                  testID="welcome-switch-music"
                />
              </View>
              <View
                style={[
                  styles.audioVolumeControl,
                  !audioPreferences.musicEnabled && styles.audioControlDisabled,
                ]}
              >
                <View style={styles.audioVolumeHeader}>
                  <ThemedText style={styles.audioVolumeLabel}>
                    Volume
                  </ThemedText>
                  <ThemedText style={styles.audioVolumeValue}>
                    {Math.round(audioPreferences.musicVolume * 100)}%
                  </ThemedText>
                </View>
                <Slider
                  style={styles.audioSlider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={audioPreferences.musicVolume}
                  disabled={!audioPreferences.musicEnabled}
                  onValueChange={(value) =>
                    handleAudioVolumeChange("musicVolume", value)
                  }
                  minimumTrackTintColor={
                    isDark ? Colors.dark.primary : Colors.light.primary
                  }
                  maximumTrackTintColor={
                    isDark ? Colors.dark.border : Colors.light.border
                  }
                  thumbTintColor={
                    isDark ? Colors.dark.primary : Colors.light.primary
                  }
                  testID="welcome-slider-music"
                />
              </View>
            </View>

            <View style={styles.audioPreferenceDivider} />

            <View style={styles.audioPreferenceGroup}>
              <View style={styles.audioPreferenceHeader}>
                <View style={styles.audioPreferenceLabel}>
                  <Feather
                    name="volume-2"
                    size={20}
                    color={isDark ? Colors.dark.primary : Colors.light.primary}
                  />
                  <ThemedText style={{ fontFamily: Fonts.bodyMedium }}>
                    Sound Effects
                  </ThemedText>
                </View>
                <Switch
                  value={audioPreferences.soundEnabled}
                  onValueChange={(value) =>
                    handleAudioToggle("soundEnabled", value)
                  }
                  trackColor={{
                    false: isDark ? Colors.dark.border : Colors.light.border,
                    true: isDark ? Colors.dark.primary : Colors.light.primary,
                  }}
                  thumbColor="#FFFFFF"
                  testID="welcome-switch-sound"
                />
              </View>
              <View
                style={[
                  styles.audioVolumeControl,
                  !audioPreferences.soundEnabled && styles.audioControlDisabled,
                ]}
              >
                <View style={styles.audioVolumeHeader}>
                  <ThemedText style={styles.audioVolumeLabel}>
                    Volume
                  </ThemedText>
                  <ThemedText style={styles.audioVolumeValue}>
                    {Math.round(audioPreferences.soundVolume * 100)}%
                  </ThemedText>
                </View>
                <Slider
                  style={styles.audioSlider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  value={audioPreferences.soundVolume}
                  disabled={!audioPreferences.soundEnabled}
                  onValueChange={(value) =>
                    handleAudioVolumeChange("soundVolume", value)
                  }
                  minimumTrackTintColor={
                    isDark ? Colors.dark.primary : Colors.light.primary
                  }
                  maximumTrackTintColor={
                    isDark ? Colors.dark.border : Colors.light.border
                  }
                  thumbTintColor={
                    isDark ? Colors.dark.primary : Colors.light.primary
                  }
                  testID="welcome-slider-sound"
                />
              </View>
            </View>

            <Pressable
              style={styles.audioSaveButton}
              onPress={handleSaveAudioPreferences}
              testID="welcome-button-save-audio"
            >
              <LinearGradient
                colors={["#6366F1", "#4F46E5"]}
                style={styles.audioSaveButtonGradient}
              >
                <ThemedText style={styles.audioSaveButtonText}>
                  Save Preferences
                </ThemedText>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

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
  audioModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: Spacing.xl,
  },
  audioModalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    ...Shadows.medium,
  },
  audioWelcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    marginBottom: Spacing.md,
  },
  audioModalTitle: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  audioModalDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.72,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  audioPreferenceGroup: {
    width: "100%",
  },
  audioPreferenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioPreferenceLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  audioVolumeControl: {
    marginTop: Spacing.sm,
  },
  audioControlDisabled: {
    opacity: 0.42,
  },
  audioVolumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  audioVolumeLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  audioVolumeValue: {
    fontSize: 12,
    opacity: 0.7,
  },
  audioSlider: {
    width: "100%",
    height: 34,
  },
  audioPreferenceDivider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    marginVertical: Spacing.md,
  },
  audioSaveButton: {
    width: "100%",
    marginTop: Spacing.lg,
    ...Shadows.small,
  },
  audioSaveButtonGradient: {
    minHeight: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  audioSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Fonts.bodyMedium,
  },
});
