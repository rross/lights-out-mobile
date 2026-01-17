import levelConfigs from '../data/levelConfigs';

const GRID_SIZE = 12;

export const COLORS: Record<number, string> = {
  0: '#ffeb3b',
  1: '#000000',
  2: '#f44336',
  3: '#2196F3',
  4: '#9c27b0',
  5: '#ffb3da',
  6: '#2e7d32',
  7: '#00bcd4',
};

export function getColorForState(state: number, level: number): string {
  if (level <= 15 || level === 16) {
    return state === 0 ? COLORS[0] : COLORS[1];
  }
  return COLORS[state] || COLORS[1];
}

export function getLevelConfig(level: number): { moves: number; states: number } {
  return levelConfigs[level] || { moves: 20, states: 2 };
}

export function createEmptyBoard(): number[][] {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(1));
}

function getNextState(current: number, states: number): number {
  if (states === 2) {
    return 1 - current;
  }
  
  const stateOrder = buildStateOrder(states);
  const currentIndex = stateOrder.indexOf(current);
  if (currentIndex === -1) return current;
  return stateOrder[(currentIndex + 1) % stateOrder.length];
}

function buildStateOrder(states: number): number[] {
  const order: number[] = [0, 1];
  for (let s = states - 1; s >= 2; s--) {
    order.push(s);
  }
  return order;
}

export function toggleCell(board: number[][], row: number, col: number, level: number): number[][] {
  const newBoard = board.map(r => [...r]);
  const config = getLevelConfig(level);
  const states = config.states;
  
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    const current = newBoard[row][col];
    newBoard[row][col] = getNextState(current, states);
  }
  return newBoard;
}

export function applyMove(board: number[][], row: number, col: number, level: number): number[][] {
  let newBoard = board.map(r => [...r]);
  
  const directions = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [dx, dy] of directions) {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
      newBoard = toggleCell(newBoard, newRow, newCol, level);
    }
  }
  
  return newBoard;
}

export function checkWin(board: number[][]): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== 1) {
        return false;
      }
    }
  }
  return true;
}

export function generateSolvableBoard(level: number): number[][] {
  const config = getLevelConfig(level);
  const targetMoves = config.moves;
  
  let board = createEmptyBoard();
  
  const numReverseMoves = targetMoves < 20 
    ? targetMoves 
    : Math.ceil(targetMoves * 0.9);
  
  for (let i = 0; i < numReverseMoves; i++) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    board = applyMove(board, row, col, level);
  }
  
  if (checkWin(board)) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    board = applyMove(board, row, col, level);
  }
  
  return board;
}

export const GRID_SIZE_EXPORT = GRID_SIZE;
export const TOTAL_LEVELS = 154;
