# Color Cascade - Replit.md

## Overview

Color Cascade is a strategic color puzzle mobile game built with Expo/React Native. Players manipulate a 12x12 grid to achieve a single-color solution through cascading neighbor interactions. The game features 154 levels with increasing complexity, progressing from 2-state (on/off) puzzles to multi-state color cycling challenges with up to 8 different states.

The project follows a full-stack architecture with an Express.js backend and React Native frontend, designed to run on iOS, Android, and web platforms from a single codebase.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Expo SDK 54 with React Native 0.81, using the new architecture with React 19.

**Navigation**: Stack-based navigation using `@react-navigation/native-stack` with four main screens:
- Home Screen - Entry point with play button and progress overview
- Level Select Screen - Grid of 154 level cards with completion status
- Game Screen - Active 12x12 puzzle grid gameplay
- Settings Screen - Audio, haptics, and progress reset options

**State Management**: 
- Local component state with React hooks for UI interactions
- AsyncStorage for persistent game progress (completed levels, stars, settings)
- TanStack React Query available for server state (currently minimal backend usage)

**Animation System**: React Native Reanimated for smooth, performant animations including:
- Spring-based button press feedback
- Cell color transitions
- Win celebration animations

**Styling Approach**: 
- Centralized theme constants in `client/constants/theme.ts`
- Light/dark mode support with automatic system preference detection
- Playful, toy-like aesthetic with rounded corners and bouncy interactions

### Game Logic

**Core Mechanics** (in `client/utils/gameLogic.ts`):
- 12x12 grid with cascading cell state changes
- Tapping a cell toggles it and adjacent neighbors
- Win condition: All cells match the target state (typically state 1/black)
- Level progression increases state count (2→3→4→5→6→7→8 states)

**Level Configuration** (in `client/data/levelConfigs.ts`):
- 154 total levels with predefined move limits and state counts
- Solvable boards generated algorithmically with reverse-engineering approach

### Backend Architecture

**Server**: Express.js with TypeScript running on port 5000.

**Database**: 
- PostgreSQL with Drizzle ORM for schema management
- Current schema includes a basic users table (minimal usage currently)
- In-memory storage fallback available via `MemStorage` class

**API Design**: RESTful routes prefixed with `/api` (structure ready but game is primarily client-side).

### Path Aliases

The project uses module path aliases configured in both TypeScript and Babel:
- `@/` → `./client/`
- `@shared/` → `./shared/`

### Build System

**Development**: 
- `npm run expo:dev` - Start Expo development server
- `npm run server:dev` - Start Express server with tsx

**Production**:
- `npm run expo:static:build` - Build static web bundle
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server

## External Dependencies

### Core Framework
- **Expo SDK 54**: Cross-platform React Native framework
- **React Native 0.81**: Mobile UI framework
- **React Navigation 7.x**: Native stack navigation

### Database & API
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations
- **Express.js**: Backend HTTP server

### UI & Animation
- **React Native Reanimated**: High-performance animations
- **Expo Linear Gradient**: Gradient backgrounds
- **Expo Haptics**: Tactile feedback on cell taps
- **Expo Blur/Glass Effect**: iOS-style blur effects

### Fonts
- **Fredoka**: Display/decorative font for titles
- **Inter**: UI text font

### Storage
- **AsyncStorage**: Local persistent storage for game progress and settings

### Development Tools
- **TypeScript**: Type safety across client and server
- **ESLint + Prettier**: Code formatting and linting
- **Drizzle Kit**: Database migration tooling