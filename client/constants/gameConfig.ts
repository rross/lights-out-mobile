// Development-only testing switch.
// __DEV__ is false in production builds, so normal level progression is restored
// automatically when the game is published.
export const TEST_MODE_UNLOCK_ALL_LEVELS =
  typeof __DEV__ !== "undefined" && __DEV__;