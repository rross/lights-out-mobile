import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts, Shadows, GameColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getCompletedLevels, getLevelStars, getCurrentLevel, getSettings } from "@/utils/storage";
import { TOTAL_LEVELS, getLevelConfig } from "@/utils/gameLogic";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width } = Dimensions.get("window");
const COLUMNS = 4;
const CARD_GAP = Spacing.sm;
const HORIZONTAL_PADDING = Spacing.lg;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (COLUMNS - 1)) / COLUMNS;

interface LevelCardProps {
  level: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  stars: number;
  stateCount: number;
  onPress: () => void;
  index: number;
}

function LevelCard({ level, isCompleted, isUnlocked, stars, stateCount, onPress, index }: LevelCardProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  function handlePressIn() {
    scale.value = withSpring(0.95, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const stateColor = stateCount <= 2 ? GameColors[0] : GameColors[stateCount - 1];
  const bgColor = isUnlocked
    ? isDark
      ? Colors.dark.cardSurface
      : Colors.light.cardSurface
    : isDark
    ? Colors.dark.backgroundSecondary
    : Colors.light.backgroundSecondary;

  return (
    <Animated.View entering={FadeInUp.delay(index * 20).duration(300)}>
      <AnimatedPressable
        style={[
          styles.levelCard,
          animatedStyle,
          {
            backgroundColor: bgColor,
            opacity: isUnlocked ? 1 : 0.5,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isUnlocked}
        testID={`button-level-${level}`}
      >
        <View style={[styles.stateIndicator, { backgroundColor: stateColor }]} />
        {isUnlocked ? (
          <>
            <ThemedText style={[styles.levelNumber, { fontFamily: Fonts.displaySemiBold }]}>
              {level}
            </ThemedText>
            {isCompleted && stars > 0 ? (
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((s) => (
                  <Feather
                    key={s}
                    name="star"
                    size={10}
                    color={s <= stars ? "#FBBF24" : isDark ? Colors.dark.border : Colors.light.border}
                    style={{ marginHorizontal: 1 }}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <Feather
            name="lock"
            size={20}
            color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function LevelSelectScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation]);

  async function loadData() {
    const completed = await getCompletedLevels();
    const stars = await getLevelStars();
    const current = await getCurrentLevel();
    const settings = await getSettings();
    setCompletedLevels(completed);
    setLevelStars(stars);
    setCurrentLevel(current);
    setHapticEnabled(settings.hapticEnabled);
  }

  const handleLevelPress = useCallback((level: number) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Game", { level });
  }, [navigation, hapticEnabled]);

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const isCompleted = completedLevels.has(item);
      const isUnlocked = item === 1 || completedLevels.has(item - 1) || item <= currentLevel;
      const stars = levelStars[item] || 0;
      const config = getLevelConfig(item);

      return (
        <LevelCard
          level={item}
          isCompleted={isCompleted}
          isUnlocked={isUnlocked}
          stars={stars}
          stateCount={config.states}
          onPress={() => handleLevelPress(item)}
          index={index}
        />
      );
    },
    [completedLevels, levelStars, currentLevel, handleLevelPress]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={levels}
        renderItem={renderItem}
        keyExtractor={(item) => item.toString()}
        numColumns={COLUMNS}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: Spacing.lg,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  levelCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
    overflow: "hidden",
  },
  stateIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  levelNumber: {
    fontSize: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
});
