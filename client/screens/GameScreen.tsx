import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { View, StyleSheet, Pressable, useWindowDimensions, Modal, Image } from "react-native";
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
  getLives,
  setLives,
  resetLives,
  MAX_LIVES,
} from "@/utils/storage";
import celebrationImage from "../../assets/images/celebration-win.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameRouteProp = RouteProp<RootStackParamList, "Game">;

const GRID_PADDING = Spacing.lg;
const CELL_GAP = 1;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * (percent / 100),
    g + (255 - g) * (percent / 100),
    b + (255 - b) * (percent / 100)
  );
}

function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - percent / 100), g * (1 - percent / 100), b * (1 - percent / 100));
}

interface CellProps {
  row: number;
  col: number;
  state: number;
  level: number;
  cellSize: number;
  onPress: () => void;
}

interface StoneMark {
  left: string;
  top: string;
  width: number;
  height: number;
  rotation: string;
  color: string;
}

function StoneTexture({ row, col, state }: Pick<CellProps, "row" | "col" | "state">) {
  // Use the cell coordinates as a stable seed so the stone pattern varies across
  // the board without changing on every render.
  const seed = Math.abs(row * 31 + col * 17 + state * 13);
  const marks: StoneMark[] = [
    {
      left: `${8 + (seed % 14)}%`,
      top: `${12 + (seed % 18)}%`,
      width: 18 + (seed % 14),
      height: 3 + (seed % 2),
      rotation: `${-26 + (seed % 18)}deg`,
      color: "rgba(255, 255, 255, 0.14)",
    },
    {
      left: `${52 + (seed % 16)}%`,
      top: `${28 + (seed % 16)}%`,
      width: 14 + (seed % 12),
      height: 2 + (seed % 2),
      rotation: `${18 + (seed % 20)}deg`,
      color: "rgba(0, 0, 0, 0.11)",
    },
    {
      left: `${14 + (seed % 20)}%`,
      top: `${66 + (seed % 12)}%`,
      width: 12 + (seed % 10),
      height: 3,
      rotation: `${-10 + (seed % 22)}deg`,
      color: "rgba(255, 255, 255, 0.1)",
    },
    {
      left: `${68 + (seed % 10)}%`,
      top: `${70 + (seed % 12)}%`,
      width: 4 + (seed % 4),
      height: 4 + (seed % 3),
      rotation: "0deg",
      color: "rgba(0, 0, 0, 0.12)",
    },
  ];

  return (
    <View pointerEvents="none" style={styles.stoneTextureOverlay}>
      {marks.map((mark, index) => (
        <View
          key={index}
          style={[
            styles.stoneMark,
            {
              left: mark.left,
              top: mark.top,
              width: mark.width,
              height: mark.height,
              backgroundColor: mark.color,
              transform: [{ rotate: mark.rotation }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function Cell({ row, col, state, level, cellSize, onPress }: CellProps) {
  const scale = useSharedValue(1);
  const baseColor = getColorForState(state, level);
  
  // Add a little more depth while keeping the transitions soft.
  const edgeColor = darkenColor(baseColor, 18);
  const centerColor = adjustBrightness(baseColor, 14);

  function handlePressIn() {
    scale.value = withSpring(0.9, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.cell, { width: cellSize, height: cellSize }, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={`cell-${row}-${col}`}
    >
      <LinearGradient
        colors={[edgeColor, baseColor, centerColor, baseColor, edgeColor] as const}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cellGradient}
      >
        <LinearGradient
          colors={[edgeColor + "50", "transparent", "transparent", "transparent", edgeColor + "50"] as const}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cellGradient}
        />
      </LinearGradient>
        <StoneTexture row={row} col={col} state={state} />
    </AnimatedPressable>
  );
}

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
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
  const [showFailModal, setShowFailModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [lastBoard, setLastBoard] = useState<number[][] | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [lives, setLivesState] = useState(MAX_LIVES);
  const movesUsedRef = useRef(0);

  // Compute cell size reactively — recalculates on every orientation change or device resize.
  // In landscape the available height is the limiting dimension, so we constrain by both axes
  // and pick whichever produces the smaller cell.
  const cellSize = useMemo(() => {
    const isLandscape = width > height;
    // Reserved vertical space: header + moves counter block + bottom buttons + breathing room
    const reservedHeight = headerHeight + (isLandscape ? 120 : 160);
    const availableHeight = height - insets.top - insets.bottom - reservedHeight;
    const byHeight = (availableHeight - CELL_GAP * (GRID_SIZE_EXPORT - 1)) / GRID_SIZE_EXPORT;
    const byWidth = (width - GRID_PADDING * 2 - CELL_GAP * (GRID_SIZE_EXPORT - 1)) / GRID_SIZE_EXPORT;
    return Math.max(4, Math.floor(Math.min(byWidth, byHeight)));
  }, [width, height, headerHeight, insets.top, insets.bottom]);

  const movesScale = useSharedValue(1);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Level ${level}`,
    });
    initGame();
    loadSettings();
    loadLives();
  }, [level]);

  async function loadSettings() {
    const settings = await getSettings();
    setHapticEnabled(settings.hapticEnabled);
  }

  async function loadLives() {
    const stored = await getLives();
    setLivesState(stored);
  }

  function initGame() {
    const newBoard = generateSolvableBoard(level);
    setBoard(newBoard);
    setMovesRemaining(config.moves);
    movesUsedRef.current = 0;
    setLastBoard(null);
    setCanUndo(false);
    setShowWinModal(false);
    setShowFailModal(false);
    setShowGameOverModal(false);
  }

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (movesRemaining <= 0 || showWinModal || showFailModal || showGameOverModal) return;

      if (hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      setLastBoard(board);
      setCanUndo(true);

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
      } else if (newMovesRemaining === 0) {
        handleFail();
      }
    },
    [board, movesRemaining, level, showWinModal, showFailModal, showGameOverModal, hapticEnabled]
  );

  async function handleFail() {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    const currentLives = await getLives();
    const newLives = currentLives - 1;
    await setLives(newLives);
    setLivesState(newLives);
    if (newLives <= 0) {
      setShowGameOverModal(true);
    } else {
      setShowFailModal(true);
    }
  }

  function handleTryAgain() {
    // Resets the board but does NOT deduct another life
    const newBoard = generateSolvableBoard(level);
    setBoard(newBoard);
    setMovesRemaining(config.moves);
    movesUsedRef.current = 0;
    setLastBoard(null);
    setCanUndo(false);
    setShowFailModal(false);
  }

  function handleQuitToHome() {
    setShowFailModal(false);
    setShowGameOverModal(false);
    navigation.navigate("Home");
  }

  async function handlePlayAgain() {
    await resetLives();
    setLivesState(MAX_LIVES);
    setShowGameOverModal(false);
    navigation.replace("Game", { level: 1 });
  }

  async function handleWin() {
    if (hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await markLevelCompleted(level);

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

  function handleUndo() {
    if (!canUndo || !lastBoard) return;

    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setBoard(lastBoard);
    setMovesRemaining(prev => prev + 1);
    movesUsedRef.current -= 1;
    setCanUndo(false);
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
        {/* Lives row */}
        <View style={styles.livesRow}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Feather
              key={i}
              name="heart"
              size={16}
              color={i < lives ? "#EF4444" : isDark ? "#333333" : "#CCCCCC"}
            />
          ))}
        </View>

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
                  cellSize={cellSize}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.bottomButtons, { bottom: insets.bottom + Spacing.xl }]}>
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface,
                opacity: canUndo ? 1 : 0.5,
              },
            ]}
            onPress={handleUndo}
            disabled={!canUndo}
            testID="button-undo"
          >
            <Feather
              name="corner-up-left"
              size={20}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
            <ThemedText style={[styles.actionButtonText, { fontFamily: Fonts.bodyMedium }]}>
              Undo
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              {
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
            <ThemedText style={[styles.actionButtonText, { fontFamily: Fonts.bodyMedium }]}>
              Reset
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Level Failed Modal */}
      <Modal
        visible={showFailModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface },
            ]}
          >
            <View style={styles.failIconRow}>
              <Feather name="x-circle" size={56} color="#EF4444" />
            </View>
            <ThemedText style={[styles.winTitle, { fontFamily: Fonts.display }]}>
              Out of Moves!
            </ThemedText>
            <View style={styles.livesRemainingRow}>
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Feather
                  key={i}
                  name="heart"
                  size={20}
                  color={i < lives ? "#EF4444" : isDark ? "#333333" : "#CCCCCC"}
                />
              ))}
            </View>
            <ThemedText style={[styles.movesUsedText, { fontFamily: Fonts.body }]}>
              {lives} {lives === 1 ? "life" : "lives"} remaining
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable style={styles.primaryButton} onPress={handleTryAgain} testID="button-try-again">
                <LinearGradient
                  colors={["#6366F1", "#4F46E5"]}
                  style={styles.primaryButtonGradient}
                >
                  <Feather name="rotate-ccw" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.primaryButtonText}>Try Again</ThemedText>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={[
                  styles.secondaryButton,
                  { borderColor: isDark ? Colors.dark.border : Colors.light.border },
                ]}
                onPress={handleQuitToHome}
                testID="button-quit"
              >
                <Feather name="home" size={18} color={isDark ? Colors.dark.text : Colors.light.text} />
                <ThemedText style={[styles.secondaryButtonText, { fontFamily: Fonts.bodyMedium }]}>
                  Quit to Home
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Game Over Modal */}
      <Modal
        visible={showGameOverModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface },
            ]}
          >
            <View style={styles.failIconRow}>
              <Feather name="alert-circle" size={56} color="#EF4444" />
            </View>
            <ThemedText style={[styles.gameOverTitle, { fontFamily: Fonts.display }]}>
              Game Over
            </ThemedText>
            <ThemedText style={[styles.movesUsedText, { fontFamily: Fonts.body }]}>
              You've used all your lives. Better luck next time!
            </ThemedText>
            <View style={styles.modalButtons}>
              <Pressable style={styles.primaryButton} onPress={handlePlayAgain} testID="button-play-again">
                <LinearGradient
                  colors={["#6366F1", "#4F46E5"]}
                  style={styles.primaryButtonGradient}
                >
                  <Feather name="play" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.primaryButtonText}>Play Again</ThemedText>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={[
                  styles.secondaryButton,
                  { borderColor: isDark ? Colors.dark.border : Colors.light.border },
                ]}
                onPress={handleQuitToHome}
                testID="button-go-home"
              >
                <Feather name="home" size={18} color={isDark ? Colors.dark.text : Colors.light.text} />
                <ThemedText style={[styles.secondaryButtonText, { fontFamily: Fonts.bodyMedium }]}>
                  Return to Home
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={showWinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(180)}
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? Colors.dark.cardSurface : Colors.light.cardSurface },
            ]}
          >
            <Image source={celebrationImage} style={styles.celebrationImage} />
            <ThemedText
              style={[
                level === TOTAL_LEVELS ? styles.completionTitle : styles.winTitle,
                { fontFamily: Fonts.display },
              ]}
            >
              {level === TOTAL_LEVELS
                ? "Congratulations! You have completed all levels of Lights Off Color Cascade"
                : "Puzzle Solved!"}
            </ThemedText>

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
              ) : (
                <Pressable style={styles.primaryButton} onPress={handlePlayAgain} testID="button-final-play-again">
                  <LinearGradient
                    colors={["#6366F1", "#4F46E5"]}
                    style={styles.primaryButtonGradient}
                  >
                    <Feather name="play" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.primaryButtonText}>Play Again</ThemedText>
                  </LinearGradient>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.secondaryButton,
                  { borderColor: isDark ? Colors.dark.border : Colors.light.border },
                ]}
                onPress={level === TOTAL_LEVELS ? handleQuitToHome : handleReplay}
                testID={level === TOTAL_LEVELS ? "button-final-home" : "button-replay"}
              >
                <Feather
                  name={level === TOTAL_LEVELS ? "home" : "rotate-ccw"}
                  size={18}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
                <ThemedText style={[styles.secondaryButtonText, { fontFamily: Fonts.bodyMedium }]}>
                  {level === TOTAL_LEVELS ? "Return to Home" : "Replay"}
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
    borderRadius: 4,
    overflow: "hidden",
  },
  cellGradient: {
    flex: 1,
    borderRadius: 4,
  },
  stoneTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  stoneMark: {
    position: "absolute",
    borderRadius: BorderRadius.full,
  },
  bottomButtons: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  actionButtonText: {
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
  completionTitle: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: "center",
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
  livesRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  livesRemainingRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  failIconRow: {
    marginBottom: Spacing.lg,
  },
  gameOverTitle: {
    fontSize: 32,
    marginBottom: Spacing.lg,
  },
});
