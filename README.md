# Big Igor - Gamified Task Management System. Brought to you by the FINDEST MINISTRY OF TRUTH AND AI.

Big Igor is a Soviet-themed, gamified task management application that turns productivity into an engaging experience. The application features a unique aesthetic inspired by Soviet-era propaganda posters and combines it with modern task management functionality. This is done as part of an initiative to gamify and track KPIs.

## 🎯 Features

### Level-Based Progression
- 5 distinct levels of tasks
- Each level contains 5 tasks that need to be completed
- Progress tracking for individual levels and overall completion
- Locked levels become available as you progress

### Visual Feedback System
- Dynamic progress bars with color gradients
- Warning system with visual indicators
- Level completion badges and locks
- Soviet-themed UI elements and animations

### Gamification Elements
- Trophy system for completed levels
- Warning system that adds tension and urgency
- Visual state changes based on progress and warnings
- "Re-education" threat system for excessive warnings

### UI/UX Features
- Responsive design
- Animated elements (blinking warnings, pulsing effects)
- Clear visual hierarchy
- Interactive task toggles
- Expandable/collapsible level details

## 🔧 Technical Implementation

### State Management
- Uses custom state management with `levelStore`
- Tracks:
  - Level completion status
  - Task completion status
  - Warning counts
  - Active/inactive states

### Visual Components
- Custom progress indicators
- Dynamic color systems based on state
- Completion badges
- Warning indicators
- Lock mechanisms for completed levels

### Styling
- Tailwind CSS for styling
- Custom color palette featuring:
  - Soviet Gold
  - Soviet Red
  - Various state-based colors
- Custom animations and transitions
- Propaganda-style typography

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 Theme Customization

The application uses a custom Soviet-inspired theme with the following key colors:
- Soviet Gold: Used for highlights and important elements
- Soviet Red: Used for warnings and alternate highlighting
- Green: Used for completion states
- Gray: Used for inactive states

## 📝 Task Structure

Each level contains:
- A unique name
- A description
- 5 tasks that can be completed
- Progress tracking
- Warning counter
- Active/inactive state

## 🔒 Level Completion System

When a level is completed:
1. The level becomes locked
2. A green completion badge appears
3. The progress bar turns solid green
4. Tasks become hidden
5. The level can no longer be expanded

## ⚠️ Warning System

- Levels can accumulate up to 3 warnings
- Visual indicators change with warning counts
- At 3 warnings, the level enters a critical state with pulsing animations

## 🛠️ Technical Requirements

- Node.js
- React
- Tailwind CSS
- Modern web browser with CSS Grid and Flexbox support

## 🎮 User Interaction Flow

1. Users start at Level 1
2. Complete tasks by clicking them
3. Progress is tracked and displayed
4. Warnings accumulate for specific actions
5. Levels are completed and locked when all tasks are done
6. Overall progress is tracked at the top

## 🔐 Security Features

- Completed levels are locked to prevent modifications
- Progress is tracked and cannot be manipulated
- Warning system provides accountability

## 🎨 Design Philosophy

The application combines:
- Soviet-era aesthetic
- Modern UI/UX principles
- Gamification elements
- Clear visual feedback
- Progressive disclosure of content

This creates an engaging task management experience that motivates users through both progress and consequence mechanics.

