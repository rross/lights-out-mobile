import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, Dimensions, Modal, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors, Spacing, BorderRadius, Fonts, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  generateSolvableBoard,
  applyMove,
  checkWin,
  getColorForState,
  getLevelConfig,
  GRID_SIZE_EXPORT,
  TOTAL_LEVELS,
} from "@/utils/gameLogic";
import {
  markLevelCompleted,
  setCurrentLevel,
  getSettings,
} from "@/utils/storage";
import celebrationImage from "../../assets/images/celebration-win.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, "Game">;

const { width } = Dimensions.get("window");
const GRID_PADDING = Spacing.lg;
const CELL_GAP = 1;
const GRID_WIDTH = width - GRID_PADDING * 2;
const CELL_SIZE = (GRID_WIDTH - CELL_GAP * (GRID_SIZE_EXPORT - 1)) / GRID_SIZE_EXPORT;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CellProps {
  row: number;
  col: number;
  state: number;
  level: number;
  onPress: () => void;
}

function Cell({ row, col, state, level, onPress }: CellProps) {
  const scale = useSharedValue(1);
  const color = getColorForState(state, level);

  function handlePressIn() {
    scale.value = withSpring(0.9, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: color,
  }));

  return (
    <AnimatedPressable
      style={[styles.cell, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={`cell-${row}-${col}`}
    />
  );
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameRouteProp>();
  const { isDark } = useTheme();
  const level = route.params.level;

  const config = getLevelConfig(level);
  const [board, setBoard] = useState<number[][]>([]);
  const [movesRemaining, setMovesRemaining] = useState(config.moves);
  const [showWinModal, setShowWinModal] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const movesUsedRef = useRef(0);

  const movesScale = useSharedValue(1);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Level ${level}`,
    });
    initGame();
    loadSettings();
  }, [level]);

  async function loadSettings() {
    const settings = await getSettings();
    setHapticEnabled(settings.hapticEnabled);
  }

  function initGame() {
    const newBoard = generateSolvableBoard(level);
    setBoard(newBoard);
    setMovesRemaining(config.moves);
    movesUsedRef.current = 0;
    setShowWinModal(false);
  }

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (movesRemaining <= 0 || showWinModal) return;

      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const newBoard = applyMove(board, row, col, level);
      setBoard(newBoard);

      const newMovesRemaining = movesRemaining - 1;
      setMovesRemaining(newMovesRemaining);
      movesUsedRef.current += 1;

      movesScale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withSpring(1, { damping: 15 })
      );

      if (checkWin(newBoard)) {
        handleWin();
      }
    },
    [board, movesRemaining, level, showWinModal, hapticEnabled]
  );

  async function handleWin() {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const movesUsed = movesUsedRef.current;
    const optimalMoves = Math.floor(config.moves * 0.6);
    const goodMoves = Math.floor(config.moves * 0.8);

    let stars = 1;
    if (movesUsed <= optimalMoves) {
      stars = 3;
    } else if (movesUsed <= goodMoves) {
      stars = 2;
    }

    setStarsEarned(stars);
    await markLevelCompleted(level, stars);

    if (level < TOTAL_LEVELS) {
      await setCurrentLevel(level + 1);
    }

    setShowWinModal(true);
  }

  function handleNextLevel() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (level < TOTAL_LEVELS) {
      navigation.replace("Game", { level: level + 1 });
    } else {
      navigation.goBack();
    }
  }

  function handleReplay() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    initGame();
  }

  function handleReset() {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    initGame();
  }

  const movesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: movesScale.value }],
  }));

  const movesColor =
    movesRemaining <= 5
      ? "#EF4444"
      : movesRemaining <= 10
      ? "#F59E0B"
      : isDark
      ? Colors.dark.text
      : Colors.light.text;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.md }]}>
        <Animated.View style={[styles.movesContainer, movesAnimatedStyle]}>
          <ThemedText style={[styles.movesLabel, { fontFamily: Fonts.bodyMedium }]}>
            Moves Remaining
          </ThemedText>
          <ThemedText
            style={[styles.movesValue, { fontFamily: Fonts.displaySemiBold, color: movesColor }]}
          >
            {movesRemaining}
          </ThemedText>
        </Animated.View>

        <View style={[styles.gridContainer, { backgroundColor: isDark ? "#1a1a1a" : "#2a2a2a" }]}>
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cellState, colIndex) => (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  state={cellState}
                  level={level}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.resetButton,
            {
              bottom: insets.bottom + Spacing.xl,
              backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface,
            },
          ]}
          onPress={handleReset}
          testID="button-reset"
        >
          <Feather
            name="rotate-ccw"
            size={20}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
          <ThemedText style={[styles.resetText, { fontFamily: Fonts.bodyMedium }]}>
            Reset
          </ThemedText>
        </Pressable>
      </View>

      <Modal
        visible={showWinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={ZoomIn.springify().damping(15)}
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface },
            ]}
          >
            <Image source={celebrationImage} style={styles.celebrationImage} />
            <ThemedText style={[styles.winTitle, { fontFamily: Fonts.display }]}>
              Puzzle Solved!
            </ThemedText>

            <View style={styles.starsRow}>
              {[1, 2, 3].map((s) => (
                <Animated.View key={s} entering={FadeInDown.delay(300 + s * 100)}>
                  <Feather
                    name="star"
                    size={36}
                    color={s <= starsEarned ? "#FBBF24" : isDark ? Colors.dark.border : Colors.light.border}
                  />
                </Animated.View>
              ))}
            </View>

            <ThemedText style={[styles.movesUsedText, { fontFamily: Fonts.body }]}>
              Moves used: {movesUsedRef.current} / {config.moves}
            </ThemedText>

            <View style={styles.modalButtons}>
              {level < TOTAL_LEVELS ? (
                <Pressable style={styles.primaryButton} onPress={handleNextLevel} testID="button-next-level">
                  <LinearGradient
                    colors={["#6366F1", "#4F46E5"]}
                    style={styles.primaryButtonGradient}
                  >
                    <ThemedText style={styles.primaryButtonText}>Next Level</ThemedText>
                    <Feather name="arrow-right" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </Pressable>
              ) : null}
              <Pressable
                style={[
                  styles.secondaryButton,
                  { borderColor: isDark ? Colors.dark.border : Colors.light.border },
                ]}
                onPress={handleReplay}
                testID="button-replay"
              >
                <Feather
                  name="rotate-ccw"
                  size={18}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
                <ThemedText style={[styles.secondaryButtonText, { fontFamily: Fonts.bodyMedium }]}>
                  Replay
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  movesContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  movesLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  movesValue: {
    fontSize: 36,
  },
  gridContainer: {
    padding: 2,
    borderRadius: BorderRadius.sm,
  },
  row: {
    flexDirection: "row",
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 4,
  },
  resetButton: {
    position: "absolute",
    right: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  resetText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
    ...Shadows.medium,
  },
  celebrationImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  winTitle: {
    fontSize: 28,
    marginBottom: Spacing.lg,
  },
  starsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  movesUsedText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
});
