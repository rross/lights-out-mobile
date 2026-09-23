import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { AppState, StyleSheet, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

import {
  DEFAULT_MUSIC_VOLUME,
  getAudioWelcomeCompleted,
  getSettings,
} from "@/utils/storage";

const backgroundMusic = require("../../assets/audio/bach-cello-suite-no1-prelude.mp3");

interface BackgroundMusicContextValue {
  applyMusicSettings: (enabled: boolean, volume: number) => void;
  activateMusicPreferences: (enabled: boolean, volume: number) => void;
  refreshMusicSettings: () => Promise<void>;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

function normalizeVolume(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function BackgroundMusicProvider({ children }: PropsWithChildren) {
  const musicPlayer = useAudioPlayer(backgroundMusic);
  const musicEnabledRef = useRef(true);
  const musicVolumeRef = useRef(DEFAULT_MUSIC_VOLUME);
  const audioWelcomeCompletedRef = useRef(false);

  const applyMusicSettings = useCallback(
    (enabled: boolean, volume: number) => {
      const nextVolume = normalizeVolume(volume);
      musicEnabledRef.current = enabled;
      musicVolumeRef.current = nextVolume;

      musicPlayer.loop = true;
      musicPlayer.volume = nextVolume;

      if (enabled) {
        musicPlayer.play();
      } else {
        musicPlayer.pause();
      }
    },
    [musicPlayer]
  );

  const refreshMusicSettings = useCallback(async () => {
    const audioWelcomeCompleted = await getAudioWelcomeCompleted();
    const settings = await getSettings();
    audioWelcomeCompletedRef.current = audioWelcomeCompleted;

    if (audioWelcomeCompleted) {
      applyMusicSettings(settings.musicEnabled, settings.musicVolume);
    } else {
      musicEnabledRef.current = settings.musicEnabled;
      musicVolumeRef.current = normalizeVolume(settings.musicVolume);
      musicPlayer.pause();
    }
  }, [applyMusicSettings, musicPlayer]);

  const activateMusicPreferences = useCallback(
    (enabled: boolean, volume: number) => {
      audioWelcomeCompletedRef.current = true;
      applyMusicSettings(enabled, volume);
    },
    [applyMusicSettings]
  );

  const ensureMusicPlaying = useCallback(() => {
    if (audioWelcomeCompletedRef.current && musicEnabledRef.current) {
      musicPlayer.volume = musicVolumeRef.current;
      musicPlayer.play();
    }
  }, [musicPlayer]);

  useEffect(() => {
    let active = true;

    async function initializeAudio() {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      });

      if (active) {
        await refreshMusicSettings();
      }
    }

    void initializeAudio();

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshMusicSettings();
      } else {
        musicPlayer.pause();
      }
    });

    return () => {
      active = false;
      appStateSubscription.remove();
      musicPlayer.pause();
    };
  }, [musicPlayer, refreshMusicSettings]);

  return (
    <BackgroundMusicContext.Provider
      value={{
        applyMusicSettings,
        activateMusicPreferences,
        refreshMusicSettings,
      }}
    >
      <View style={styles.container} onPointerDown={ensureMusicPlaying}>
        {children}
      </View>
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const context = useContext(BackgroundMusicContext);

  if (!context) {
    throw new Error("useBackgroundMusic must be used within BackgroundMusicProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});