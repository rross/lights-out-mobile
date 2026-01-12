# Lights Out Color Cascade Mobile - Design Guidelines

## Brand Identity

**Purpose**: A strategic color puzzle game where players manipulate a grid to achieve a single-color solution through cascading neighbor interactions.

**Aesthetic Direction**: **Playful/toy-like** with bold color confidence. The design should feel like a premium puzzle toy—rounded, bouncy interactions with delightful micro-animations. Colors are the hero, so the UI frame should be minimal and supportive, not competing.

**Memorable Element**: Satisfying haptic feedback + smooth color transitions when cells cascade. Every tap should feel like clicking a physical button—tactile, responsive, rewarding.

## Navigation Architecture

**Root Navigation**: Stack-only (single-feature puzzle game)

**Screen Flow**:
1. Home Screen → Level Select Screen → Game Screen → Win Modal
2. Settings accessible via header button on Home and Level Select

### Screen List
- **Home Screen**: Entry point with play button, level progress overview
- **Level Select Screen**: Grid of level cards showing completion status
- **Game Screen**: Active puzzle gameplay with 12x12 grid
- **Win Modal**: Celebration when puzzle is solved
- **Settings Screen**: Audio, haptics, reset progress

## Screen-by-Screen Specifications

### Home Screen
**Purpose**: Welcome players and launch into gameplay

**Layout**:
- Header: Transparent, right button (Settings icon)
- Main content: Scrollable
- Floating elements: None
- Safe area: Top = headerHeight + 40, Bottom = insets.bottom + 40

**Components**:
- App title (large, centered, decorative font)
- Tagline below title
- Primary "Play" button (large, rounded, centered)
- Progress indicator showing levels completed (e.g., "Level 24/154")
- Background: Soft gradient from top to bottom

### Level Select Screen
**Purpose**: Choose specific level to play

**Layout**:
- Header: Default navigation header with back button, title "Select Level", right button (Settings icon)
- Main content: Scrollable grid
- Safe area: Top = 16, Bottom = insets.bottom + 24

**Components**:
- Grid of level cards (4 columns on phone, 6 on tablet)
- Each card shows:
  - Level number
  - Stars/completion badge if solved
  - Lock icon if not unlocked yet
  - Subtle color hint for level difficulty (number of states)
- Empty state: None (always shows level 1 at minimum)

### Game Screen
**Purpose**: Play the active puzzle level

**Layout**:
- Header: Transparent, left button (Back), title shows "Level X"
- Main content: Non-scrollable, centered grid
- Floating elements: Moves counter (top), Reset button (bottom right)
- Safe area: Top = headerHeight + 24, Bottom = insets.bottom + 24

**Components**:
- 12x12 grid of square cells (equal padding between cells)
- Moves remaining display (centered below header): "Moves: 25"
- Grid container: Centered vertically and horizontally with max width constraint
- Reset button: Small floating pill button with undo icon, bottom right corner
- Cells: Rounded squares with smooth color fill, subtle border

**Interactions**:
- Tap cell: Trigger cascade animation (cell + neighbors change color in sequence, 50ms delay between each)
- Haptic feedback on every cell tap
- Moves counter animates down when move is made

### Win Modal
**Purpose**: Celebrate puzzle completion

**Layout**: Native modal overlay, centered card

**Components**:
- Celebration illustration or confetti animation
- "Puzzle Solved!" heading
- Stars earned (based on moves efficiency: 3 stars = optimal, 2 stars = good, 1 star = completed)
- Moves used vs target display
- Two buttons: "Next Level" (primary), "Replay" (secondary)

### Settings Screen
**Purpose**: Configure app preferences

**Layout**:
- Header: Default navigation, left back button, title "Settings"
- Main content: Scrollable form
- Safe area: Top = 16, Bottom = insets.bottom + 24

**Components**:
- Sound effects toggle
- Music toggle
- Haptic feedback toggle
- Reset all progress button (destructive, requires confirmation)

## Design System

### Color Palette
**Game Colors** (from game logic, DO NOT CHANGE):
- State 0: #ffeb3b (Yellow)
- State 1: #000000 (Black - win state)
- State 2: #f44336 (Red)
- State 3: #2196F3 (Blue)
- State 4: #9c27b0 (Purple)
- State 5: #ffb3da (Light Pink)
- State 6: #2e7d32 (Dark Green)
- State 7: #00bcd4 (Cyan)

**UI Colors**:
- Primary: #6366F1 (Indigo - buttons, accents)
- Background: #F8F9FA (Soft white)
- Surface: #FFFFFF (Cards, modals)
- Text Primary: #1F2937 (Dark gray)
- Text Secondary: #6B7280 (Medium gray)
- Success: #10B981 (Green)
- Border: #E5E7EB (Light gray)

### Typography
- **Display Font**: Fredoka (Google Font) - rounded, playful for titles
- **Body Font**: Inter (Google Font) - clean, legible for UI text

**Type Scale**:
- Hero: Fredoka Bold, 48px (app title)
- H1: Fredoka SemiBold, 32px (screen titles)
- H2: Fredoka Medium, 24px (section headers)
- Body Large: Inter Medium, 18px (buttons, important text)
- Body: Inter Regular, 16px (general text)
- Caption: Inter Regular, 14px (secondary info)

### Visual Design
- Cell border radius: 8px
- Button border radius: 16px for large buttons, 12px for small
- Card border radius: 20px
- Grid cell spacing: 4px between cells
- Floating buttons: Subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Icons: Feather icon set from @expo/vector-icons
- All buttons: Scale down to 0.95 on press, haptic feedback

### Animations
- Cell color transitions: 200ms ease-out
- Cascade delay: 50ms between adjacent cells
- Button press: 100ms scale animation
- Win modal: Slide up from bottom with spring animation
- Level card tap: Quick scale + opacity feedback

## Assets to Generate

1. **icon.png**
   - Description: App icon featuring a simplified 3x3 grid with colorful cells in cascade pattern, rounded corners
   - Where used: Device home screen

2. **splash-icon.png**
   - Description: Same as app icon but optimized for splash screen
   - Where used: App launch screen

3. **empty-progress.png**
   - Description: Minimal illustration of an empty grid with subtle sparkles, friendly and encouraging
   - Where used: Home screen when no levels completed yet

4. **celebration-win.png**
   - Description: Confetti and stars bursting around a solved grid, playful and energetic
   - Where used: Win modal background

5. **avatar-default.png**
   - Description: Colorful geometric avatar (not user-facing but for settings screen)
   - Where used: Settings screen profile area

**Style for all illustrations**: Flat design with rounded shapes, using the primary UI color palette (indigo, soft gradients), avoiding realistic shadows or textures. Keep them simple and cheerful to match the Fredoka typography.