import { create } from 'zustand';
import { api } from '../services/api';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Level {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  isActive: boolean;
  warnings: number;
}

interface LevelState {
  levels: Level[];
  activeLevel: number;
  loading: boolean;
  error: string | null;
  fetchLevels: () => Promise<void>;
  toggleTask: (levelId: string, taskId: string) => Promise<void>;
  addWarning: (levelId: number) => Promise<void>;
  activateNextLevel: (currentLevelId: number) => Promise<void>;
  calculateLevelProgress: (levelId: number) => number;
  calculateOverallProgress: () => number;
  unlockLevel: (levelId: number) => Promise<void>;
}

const initialLevels: Level[] = [
  {
    id: "1",
    name: "STABILIZE THE PARTY",
    description: "MANDATORY SURVEILLANCE PROTOCOLS ACTIVATED",
    isActive: true,
    warnings: 0,
    tasks: [
      { id: "1", text: "ESTABLISH MONITORING PROTOCOLS", completed: false },
      { id: "2", text: "IMPLEMENT SURVEILLANCE SYSTEMS", completed: false },
      { id: "3", text: "VERIFY COMMUNICATION CHANNELS", completed: false },
      { id: "4", text: "SECURE PARTY INFRASTRUCTURE", completed: false },
      { id: "5", text: "ACTIVATE EMERGENCY PROTOCOLS", completed: false }
    ]
  },
  {
    id: "2",
    name: "ROOT OUT AGENTS",
    description: "SYSTEMATIC IDENTIFICATION OF DISSIDENT ELEMENTS",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: "1", text: "IDENTIFY SUSPICIOUS PATTERNS", completed: false },
      { id: "2", text: "ANALYZE BEHAVIORAL ANOMALIES", completed: false },
      { id: "3", text: "TRACK DISSIDENT ACTIVITIES", completed: false },
      { id: "4", text: "REPORT SUSPICIOUS BEHAVIOR", completed: false },
      { id: "5", text: "ELIMINATE SECURITY THREATS", completed: false }
    ]
  },
  {
    id: "3",
    name: "INFORM THE INNER PARTY",
    description: "DIRECT COMMUNICATION LINE TO CENTRAL COMMAND",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: "1", text: "COMPILE INCIDENT REPORTS", completed: false },
      { id: "2", text: "UPDATE CENTRAL DATABASE", completed: false },
      { id: "3", text: "DOCUMENT ALL DEVIATIONS", completed: false },
      { id: "4", text: "MAINTAIN SECURE CHANNELS", completed: false },
      { id: "5", text: "ARCHIVE ALL COMMUNICATIONS", completed: false }
    ]
  },
  {
    id: "4",
    name: "RESILIANCE. FORTITUDE.",
    description: "MAXIMUM RESPONSE TIME: 180 MINUTES",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: "1", text: "OPTIMIZE RESPONSE TIMES", completed: false },
      { id: "2", text: "ELIMINATE INEFFICIENCIES", completed: false },
      { id: "3", text: "MAXIMIZE PRODUCTIVITY", completed: false },
      { id: "4", text: "ENFORCE TIME PROTOCOLS", completed: false },
      { id: "5", text: "ACHIEVE PERFECT METRICS", completed: false }
    ]
  },
  {
    id: "5",
    name: "GLORY TO IGOR",
    description: "ULTIMATE LOYALTY ACHIEVED",
    isActive: false,
    warnings: 0,
    tasks: [
      { id: "1", text: "DEMONSTRATE TOTAL LOYALTY", completed: false },
      { id: "2", text: "EXCEED ALL EXPECTATIONS", completed: false },
      { id: "3", text: "ACHIEVE SUPREME EFFICIENCY", completed: false },
      { id: "4", text: "EMBODY PARTY PRINCIPLES", completed: false },
      { id: "5", text: "ETERNAL SERVICE TO IGOR", completed: false }
    ]
  }
];

// Add a debug function
const debugStore = (action: string, data?: any) => {
  console.log(`Store Action: ${action}`, data ? data : '');
};

export const useLevelStore = create<LevelState>((set, get) => ({
  levels: initialLevels,
  activeLevel: 1,
  loading: false,
  error: null,

  fetchLevels: async () => {
    debugStore('fetchLevels: starting');
    set({ loading: true, error: null });
    try {
      debugStore('fetchLevels: calling API');
      const levels = await api.getLevels();
      const levelsWithStringIds = levels.map((level: Level) => ({
        ...level,
        id: level.id.toString(),
        tasks: level.tasks.map((task: Task) => ({
          ...task,
          id: task.id.toString(),
        })),
      }));
      debugStore('fetchLevels: success', { count: levelsWithStringIds.length });
      set({ levels: levelsWithStringIds, loading: false });
    } catch (error) {
      debugStore('fetchLevels: error', error);
      set({ error: 'Failed to fetch levels', loading: false });
      // Fallback to initial levels if API fails
      set({ levels: initialLevels });
    }
  },

  toggleTask: async (levelId: string, taskId: string) => {
    set({ loading: true, error: null });
  
    try {
      const state = get();
      const level = state.levels.find(l => l.id === levelId);
      if (!level || !level.isActive) return;
  
      const task = level.tasks.find(t => t.id === taskId);
      if (!task) return;
  
      const newCompletedStatus = !task.completed;
      await api.updateTask(levelId, taskId, newCompletedStatus);
  
      const updatedTasks = level.tasks.map(t =>
        t.id === taskId ? { ...t, completed: newCompletedStatus } : t
      );
  
      const allTasksCompleted = updatedTasks.every(t => t.completed);
      const updatedCurrentLevel = {
        ...level,
        tasks: updatedTasks,
        isActive: allTasksCompleted ? false : true
      };
  
      const nextLevelId = (parseInt(levelId) + 1).toString();
      const nextLevel = state.levels.find(l => l.id === nextLevelId);
      let updatedNextLevel = null;
  
      if (allTasksCompleted && nextLevel && !nextLevel.isActive) {
        updatedNextLevel = { ...nextLevel, isActive: true };
        await api.updateLevel(nextLevelId, updatedNextLevel);
      }
  
      await api.updateLevel(levelId, updatedCurrentLevel);
  
      set((state) => ({
        levels: state.levels.map(l => {
          if (l.id === levelId) return updatedCurrentLevel;
          if (l.id === nextLevelId && updatedNextLevel) return updatedNextLevel;
          return l;
        }),
        loading: false
      }));
  
    } catch (error) {
      console.error('toggleTask error:', error);
      set({ error: 'Failed to toggle task', loading: false });
    }
  },
  
  addWarning: async (levelId: number) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const level = state.levels.find(l => l.id === levelId.toString());
      if (!level) return;
      
      const updatedLevel = { ...level, warnings: level.warnings + 1 };
      await api.updateLevel(levelId.toString(), updatedLevel);
      
      set((state: LevelState) => ({
        levels: state.levels.map((level: Level) =>
          level.id === levelId.toString()
            ? { ...level, warnings: level.warnings + 1 }
            : level
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to add warning', loading: false });
    }
  },

  activateNextLevel: async (currentLevelId: number) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const nextLevel = state.levels.find(l => l.id === (currentLevelId + 1).toString());
      if (!nextLevel) return;
      
      // Update the next level on the API
      await api.updateLevel((currentLevelId + 1).toString(), { ...nextLevel, isActive: true });
      
      set((state: LevelState) => ({
        levels: state.levels.map((level: Level) => {
          if (level.id === (currentLevelId + 1).toString()) {
            return { ...level, isActive: true };
          }
          return level;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to activate next level', loading: false });
    }
  },

  calculateLevelProgress: (levelId: number) => {
    const state = get();
    const level = state.levels.find((l: Level) => l.id === levelId.toString());
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

  unlockLevel: async (levelId: number) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const level = state.levels.find(l => l.id === levelId.toString());
      if (!level) return;
      
      // Update the level on the API to unlock it
      await api.updateLevel(levelId.toString(), { ...level, isActive: true });
      
      set((state: LevelState) => ({
        levels: state.levels.map((level: Level) => {
          if (level.id === levelId.toString()) {
            return { ...level, isActive: true };
          }
          return level;
        }),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to unlock level', loading: false });
    }
  },
})); 