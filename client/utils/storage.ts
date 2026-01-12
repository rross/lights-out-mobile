import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CURRENT_LEVEL: 'lightsout_current_level',
  COMPLETED_LEVELS: 'lightsout_completed_levels',
  LEVEL_STARS: 'lightsout_level_stars',
  SETTINGS: 'lightsout_settings',
};

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

export async function markLevelCompleted(level: number, stars: number): Promise<void> {
  try {
    const completed = await getCompletedLevels();
    completed.add(level);
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_LEVELS, JSON.stringify([...completed]));
    
    const starsMap = await getLevelStars();
    const currentStars = starsMap[level] || 0;
    if (stars > currentStars) {
      starsMap[level] = stars;
      await AsyncStorage.setItem(STORAGE_KEYS.LEVEL_STARS, JSON.stringify(starsMap));
    }
  } catch {
  }
}

export async function getLevelStars(): Promise<Record<number, number>> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LEVEL_STARS);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
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

export async function resetAllProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CURRENT_LEVEL,
      STORAGE_KEYS.COMPLETED_LEVELS,
      STORAGE_KEYS.LEVEL_STARS,
    ]);
  } catch {
  }
}
