import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CURRENT_LEVEL: 'lightsout_current_level',
  COMPLETED_LEVELS: 'lightsout_completed_levels',
  SETTINGS: 'lightsout_settings',
  LIVES: 'lightsout_lives',
};

export const MAX_LIVES = 10;

export interface GameSettings {
  hapticEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  hapticEnabled: true,
  soundEnabled: true,
};

export async function getCurrentLevel(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LEVEL);
    return value ? parseInt(value, 10) : 1;
  } catch {
    return 1;
  }
}

export async function setCurrentLevel(level: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_LEVEL, level.toString());
  } catch {
  }
}

export async function getCompletedLevels(): Promise<Set<number>> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LEVELS);
    if (value) {
      const arr = JSON.parse(value);
      return new Set(arr);
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export async function markLevelCompleted(level: number): Promise<void> {
  try {
    const completed = await getCompletedLevels();
    completed.add(level);
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_LEVELS, JSON.stringify([...completed]));
  } catch {
  }
}

export async function getSettings(): Promise<GameSettings> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return value ? { ...DEFAULT_SETTINGS, ...JSON.parse(value) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
  }
}

export async function getLives(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LIVES);
    return value !== null ? parseInt(value, 10) : MAX_LIVES;
  } catch {
    return MAX_LIVES;
  }
}

export async function setLives(lives: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LIVES, lives.toString());
  } catch {
  }
}

export async function resetLives(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LIVES, MAX_LIVES.toString());
  } catch {
  }
}

export async function resetAllProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CURRENT_LEVEL,
      STORAGE_KEYS.COMPLETED_LEVELS,
    ]);
  } catch {
  }
}
