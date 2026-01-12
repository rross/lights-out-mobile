import levelConfigs from '../data/levelConfigs';

const GRID_SIZE = 12;

export const COLORS = {
  0: '#ffeb3b',  // Yellow
  1: '#000000',  // Black (off/win state)
  2: '#f44336',  // Red
  3: '#2196F3',  // Blue
  4: '#9c27b0',  // Purple
  5: '#ffb3da',  // Light Pink
  6: '#2e7d32',  // Dark Green
  7: '#00bcd4',  // Cyan
};

export function getColorForState(state, level) {
  if (level <= 15 || level === 16) {
    return state === 0 ? COLORS[0] : COLORS[1];
  }
  return COLORS[state] || COLORS[1];
}

export function getLevelConfig(level) {
  return levelConfigs[level] || { moves: 20, states: 2 };
}

export function createEmptyBoard() {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(1));
}

export function toggleCell(board, row, col, level) {
  const newBoard = board.map(r => [...r]);
  const config = getLevelConfig(level);
  const states = config.states;
  
  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    if (level <= 15 || level === 16) {
      newBoard[row][col] = 1 - newBoard[row][col];
    } else if (states === 3) {
      // Three-state: 2 (red) -> 0 (yellow) -> 1 (black) -> 2 (red)
      const current = newBoard[row][col];
      if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 2;
    } else if (states === 4) {
      // Four-state: 3 (blue) -> 2 (red) -> 0 (yellow) -> 1 (black) -> 3 (blue)
      const current = newBoard[row][col];
      if (current === 3) newBoard[row][col] = 2;
      else if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 3;
    } else if (states === 5) {
      // Five-state: 4 (purple) -> 3 (blue) -> 2 (red) -> 0 (yellow) -> 1 (black) -> 4 (purple)
      const current = newBoard[row][col];
      if (current === 4) newBoard[row][col] = 3;
      else if (current === 3) newBoard[row][col] = 2;
      else if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 4;
    } else if (states === 6) {
      // Six-state: 5 (pink) -> 4 (purple) -> 3 (blue) -> 2 (red) -> 0 (yellow) -> 1 (black) -> 5 (pink)
      const current = newBoard[row][col];
      if (current === 5) newBoard[row][col] = 4;
      else if (current === 4) newBoard[row][col] = 3;
      else if (current === 3) newBoard[row][col] = 2;
      else if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 5;
    } else if (states === 7) {
      // Seven-state: 6 (dark green) -> 5 (pink) -> 4 (purple) -> 3 (blue) -> 2 (red) -> 0 (yellow) -> 1 (black) -> 6 (dark green)
      const current = newBoard[row][col];
      if (current === 6) newBoard[row][col] = 5;
      else if (current === 5) newBoard[row][col] = 4;
      else if (current === 4) newBoard[row][col] = 3;
      else if (current === 3) newBoard[row][col] = 2;
      else if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 6;
    } else if (states === 8) {
      // Eight-state: 7 (cyan) -> 6 (dark green) -> 5 (pink) -> 4 (purple) -> 3 (blue) -> 2 (red) -> 0 (yellow) -> 1 (black) -> 7 (cyan)
      const current = newBoard[row][col];
      if (current === 7) newBoard[row][col] = 6;
      else if (current === 6) newBoard[row][col] = 5;
      else if (current === 5) newBoard[row][col] = 4;
      else if (current === 4) newBoard[row][col] = 3;
      else if (current === 3) newBoard[row][col] = 2;
      else if (current === 2) newBoard[row][col] = 0;
      else if (current === 0) newBoard[row][col] = 1;
      else if (current === 1) newBoard[row][col] = 7;
    }
  }
  return newBoard;
}

export function applyMove(board, row, col, level) {
  let newBoard = board.map(r => [...r]);
  
  // Toggle clicked cell and adjacent cells
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

export function checkWin(board) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== 1) {
        return false;
      }
    }
  }
  return true;
}

export function generateSolvableBoard(level) {
  const config = getLevelConfig(level);
  const targetMoves = config.moves;
  const states = config.states;
  
  // Start with solved state (all black/off)
  let board = createEmptyBoard();
  
  // Calculate number of reverse moves
  const numReverseMoves = Math.max(3, Math.floor(targetMoves * 0.6));
  
  // Apply random reverse moves to create the puzzle
  for (let i = 0; i < numReverseMoves; i++) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    board = applyMove(board, row, col, level);
  }
  
  // Ensure board is not already solved
  if (checkWin(board)) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    board = applyMove(board, row, col, level);
  }
  
  return board;
}
