import { create } from 'zustand';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Level {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
  isActive: boolean;
  warnings: number;
}

interface LevelState {
  levels: Level[];
  activeLevel: number;
  toggleTask: (levelId: number, taskId: number) => void;
  addWarning: (levelId: number) => void;
  activateNextLevel: (currentLevelId: number) => void;
  calculateLevelProgress: (levelId: number) => number;
  calculateOverallProgress: () => number;
}

const initialLevels: Level[] = [
  {
    id: 1,
    name: "STABILIZE THE PARTY",
    description: "MANDATORY SURVEILLANCE PROTOCOLS ACTIVATED",
    isActive: true,
    warnings: 0,
    tasks: [
      { id: 1, text: "ESTABLISH MONITORING PROTOCOLS", completed: false },
      { id: 2, text: "IMPLEMENT SURVEILLANCE SYSTEMS", completed: false },
      { id: 3, text: "VERIFY COMMUNICATION CHANNELS", completed: false },
      { id: 4, text: "SECURE PARTY INFRASTRUCTURE", completed: false },
      { id: 5, text: "ACTIVATE EMERGENCY PROTOCOLS", completed: false }
    ]
  },
  {
    id: 2,
    name: "ROOT OUT AGENTS",
    description: "SYSTEMATIC IDENTIFICATION OF DISSIDENT ELEMENTS",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: 1, text: "IDENTIFY SUSPICIOUS PATTERNS", completed: false },
      { id: 2, text: "ANALYZE BEHAVIORAL ANOMALIES", completed: false },
      { id: 3, text: "TRACK DISSIDENT ACTIVITIES", completed: false },
      { id: 4, text: "REPORT SUSPICIOUS BEHAVIOR", completed: false },
      { id: 5, text: "ELIMINATE SECURITY THREATS", completed: false }
    ]
  },
  {
    id: 3,
    name: "INFORM THE INNER PARTY",
    description: "DIRECT COMMUNICATION LINE TO CENTRAL COMMAND",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: 1, text: "COMPILE INCIDENT REPORTS", completed: false },
      { id: 2, text: "UPDATE CENTRAL DATABASE", completed: false },
      { id: 3, text: "DOCUMENT ALL DEVIATIONS", completed: false },
      { id: 4, text: "MAINTAIN SECURE CHANNELS", completed: false },
      { id: 5, text: "ARCHIVE ALL COMMUNICATIONS", completed: false }
    ]
  },
  {
    id: 4,
    name: "FAILURE NOT AN OPTION",
    description: "MAXIMUM RESPONSE TIME: 180 MINUTES",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: 1, text: "OPTIMIZE RESPONSE TIMES", completed: false },
      { id: 2, text: "ELIMINATE INEFFICIENCIES", completed: false },
      { id: 3, text: "MAXIMIZE PRODUCTIVITY", completed: false },
      { id: 4, text: "ENFORCE TIME PROTOCOLS", completed: false },
      { id: 5, text: "ACHIEVE PERFECT METRICS", completed: false }
    ]
  },
  {
    id: 5,
    name: "GLORY TO IGOR",
    description: "ULTIMATE LOYALTY ACHIEVED",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: 1, text: "DEMONSTRATE TOTAL LOYALTY", completed: false },
      { id: 2, text: "EXCEED ALL EXPECTATIONS", completed: false },
      { id: 3, text: "ACHIEVE SUPREME EFFICIENCY", completed: false },
      { id: 4, text: "EMBODY PARTY PRINCIPLES", completed: false },
      { id: 5, text: "ETERNAL SERVICE TO IGOR", completed: false }
    ]
  }
];

export const useLevelStore = create<LevelState>((set, get) => ({
  levels: initialLevels,
  activeLevel: 1,

  toggleTask: (levelId: number, taskId: number) => {
    set((state: LevelState) => ({
      levels: state.levels.map((level: Level) => {
        if (level.id === levelId && level.isActive) {
          return {
            ...level,
            tasks: level.tasks.map((task: Task) => {
              if (task.id === taskId) {
                return { ...task, completed: !task.completed };
              }
              return task;
            }),
          };
        }
        return level;
      }),
    }));

    // Check if level is complete and activate next level
    const state = get();
    const level = state.levels.find((l: Level) => l.id === levelId);
    if (level && level.tasks.every((task: Task) => task.completed)) {
      state.activateNextLevel(levelId);
    }
  },

  addWarning: (levelId: number) => {
    set((state: LevelState) => ({
      levels: state.levels.map((level: Level) =>
        level.id === levelId
          ? { ...level, warnings: level.warnings + 1 }
          : level
      ),
    }));
  },

  activateNextLevel: (currentLevelId: number) => {
    set((state: LevelState) => ({
      levels: state.levels.map((level: Level) => {
        if (level.id === currentLevelId + 1) {
          return { ...level, isActive: true };
        }
        return level;
      }),
    }));
  },

  calculateLevelProgress: (levelId: number) => {
    const state = get();
    const level = state.levels.find((l: Level) => l.id === levelId);
    if (!level) return 0;
    
    const completedTasks = level.tasks.filter((task: Task) => task.completed).length;
    return (completedTasks / level.tasks.length) * 100;
  },

  calculateOverallProgress: () => {
    const state = get();
    const totalTasks = state.levels.length * 5; // 5 tasks per level
    const completedTasks = state.levels.reduce(
      (acc: number, level: Level) => acc + level.tasks.filter((task: Task) => task.completed).length,
      0
    );
    return (completedTasks / totalTasks) * 100;
  },
})); 