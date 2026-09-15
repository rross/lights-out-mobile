import React, { useState, useEffect } from "react";
import { View, StyleSheet, Switch, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, Spacing, BorderRadius, Fonts, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import {
  getSettings,
  saveSettings,
  resetAllProgress,
  GameSettings,
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
} from "@/utils/storage";
import Slider from "@react-native-community/slider";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [settings, setSettings] = useState<GameSettings>({
    hapticEnabled: true,
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: DEFAULT_MUSIC_VOLUME,
    soundVolume: DEFAULT_SOUND_VOLUME,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  }

  async function handleToggleHaptic(value: boolean) {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSettings = { ...settings, hapticEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }

  async function handleToggleSound(value: boolean) {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSettings = { ...settings, soundEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }

  async function handleToggleMusic(value: boolean) {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSettings = { ...settings, musicEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }

  function handleVolumeChange(key: "musicVolume" | "soundVolume", value: number) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleVolumeComplete(key: "musicVolume" | "soundVolume", value: number) {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  }

  function handleResetProgress() {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Reset Progress",
      "Are you sure you want to reset all your progress? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetAllProgress();
            if (settings.hapticEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("Progress Reset", "All your progress has been reset.");
          },
        },
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={[styles.section, { backgroundColor: theme.cardSurface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather
                name="smartphone"
                size={22}
                color={isDark ? Colors.dark.primary : Colors.light.primary}
              />
              <ThemedText style={[styles.settingLabel, { fontFamily: Fonts.bodyMedium }]}>
                Haptic Feedback
              </ThemedText>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={handleToggleHaptic}
              trackColor={{
                false: isDark ? Colors.dark.border : Colors.light.border,
                true: isDark ? Colors.dark.primary : Colors.light.primary,
              }}
              thumbColor="#FFFFFF"
              testID="switch-haptic"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather
                name="volume-2"
                size={22}
                color={isDark ? Colors.dark.primary : Colors.light.primary}
              />
              <ThemedText style={[styles.settingLabel, { fontFamily: Fonts.bodyMedium }]}>
                Sound Effects
              </ThemedText>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{
                false: isDark ? Colors.dark.border : Colors.light.border,
                true: isDark ? Colors.dark.primary : Colors.light.primary,
              }}
              thumbColor="#FFFFFF"
              testID="switch-sound"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <ThemedText style={[styles.volumeLabel, { fontFamily: Fonts.bodyMedium }]}>
                Sound Effects Volume
              </ThemedText>
              <ThemedText style={[styles.volumeValue, { color: theme.textSecondary }]}>
                {Math.round(settings.soundVolume * 100)}%
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.soundVolume}
              onValueChange={(value) => handleVolumeChange("soundVolume", value)}
              onSlidingComplete={(value) => handleVolumeComplete("soundVolume", value)}
              minimumTrackTintColor={isDark ? Colors.dark.primary : Colors.light.primary}
              maximumTrackTintColor={isDark ? Colors.dark.border : Colors.light.border}
              thumbTintColor={isDark ? Colors.dark.primary : Colors.light.primary}
              testID="slider-sound-volume"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather
                name="music"
                size={22}
                color={isDark ? Colors.dark.primary : Colors.light.primary}
              />
              <ThemedText style={[styles.settingLabel, { fontFamily: Fonts.bodyMedium }]}>
                Music
              </ThemedText>
            </View>
            <Switch
              value={settings.musicEnabled}
              onValueChange={handleToggleMusic}
              trackColor={{
                false: isDark ? Colors.dark.border : Colors.light.border,
                true: isDark ? Colors.dark.primary : Colors.light.primary,
              }}
              thumbColor="#FFFFFF"
              testID="switch-music"
            />
          </View>

          <View style={styles.volumeControl}>
            <View style={styles.volumeHeader}>
              <ThemedText style={[styles.volumeLabel, { fontFamily: Fonts.bodyMedium }]}>
                Music Volume
              </ThemedText>
              <ThemedText style={[styles.volumeValue, { color: theme.textSecondary }]}>
                {Math.round(settings.musicVolume * 100)}%
              </ThemedText>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={settings.musicVolume}
              onValueChange={(value) => handleVolumeChange("musicVolume", value)}
              onSlidingComplete={(value) => handleVolumeComplete("musicVolume", value)}
              minimumTrackTintColor={isDark ? Colors.dark.primary : Colors.light.primary}
              maximumTrackTintColor={isDark ? Colors.dark.border : Colors.light.border}
              thumbTintColor={isDark ? Colors.dark.primary : Colors.light.primary}
              testID="slider-music-volume"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.cardSurface }]}>
          <Pressable
            style={styles.dangerRow}
            onPress={handleResetProgress}
            testID="button-reset-progress"
          >
            <View style={styles.settingInfo}>
              <Feather name="trash-2" size={22} color="#EF4444" />
              <ThemedText style={[styles.dangerLabel, { fontFamily: Fonts.bodyMedium }]}>
                Reset All Progress
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ThemedText style={[styles.versionText, { color: theme.textSecondary }]}>
          Lights Out Color Cascade v1.0.0
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: 16,
  },
  volumeControl: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  volumeLabel: {
    fontSize: 14,
  },
  volumeValue: {
    fontSize: 14,
  },
  slider: {
    width: "100%",
    height: 36,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg + 22 + Spacing.md,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  dangerLabel: {
    fontSize: 16,
    color: "#EF4444",
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: "auto",
  },
});
