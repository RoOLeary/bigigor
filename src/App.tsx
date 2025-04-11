import { useState, useEffect, useRef } from 'react';
import { Bot, Target, Users, Trophy, ChevronDown, ChevronUp, CheckSquare, Square, Check, Lock, Mail } from 'lucide-react';
import { useLevelStore } from './store/levelStore';
import { useAuthStore } from './store/authStore';
import { api } from './services/api';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

// Victory sound effect for game completion
import victorySound from './assets/1984.mp3';
const VICTORY_SOUND = new Audio(victorySound);

// Add error handling for audio
VICTORY_SOUND.onerror = (e) => {
  console.error('Error loading audio:', e);
};

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

function App() {
  // Authentication state and form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [blinkWarning, setBlinkWarning] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showVictoryBanner, setShowVictoryBanner] = useState(false);
  const [showUnauthorizedOverlay, setShowUnauthorizedOverlay] = useState(false);
  const { width, height } = useWindowSize();
  
  // Ref to track if victory sound has been played
  const victorySoundPlayed = useRef(false);

  // Authentication hooks
  const { isAuthenticated, error, fadeOut, login, clearError, logout } = useAuthStore();

  // Game state hooks
  const levels = useLevelStore((state) => state.levels);
  const toggleTask = useLevelStore((state) => state.toggleTask);
  const calculateLevelProgress = useLevelStore((state) => state.calculateLevelProgress);
  const calculateOverallProgress = useLevelStore((state) => state.calculateOverallProgress);
  const fetchLevels = useLevelStore((state) => state.fetchLevels);
  const resetLevels = useLevelStore((state) => state.resetLevels);

  // Check for game completion and play victory sound
  useEffect(() => {
    const allLevelsComplete = levels.every(level => 
      level.tasks.every(task => task.completed)
    );

    if (allLevelsComplete && !victorySoundPlayed.current) {
      // First scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Then show effects
      VICTORY_SOUND.play().catch(error => {
        console.error('Error playing victory sound:', error);
      });
      victorySoundPlayed.current = true;
      setShowConfetti(true);
      setShowVictoryBanner(true);
      
      // Only hide confetti after 10 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
    }
  }, [levels]);

  // Warning blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkWarning(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Expand active level
  useEffect(() => {
    const activeLevel = levels.find((level) => level.isActive);
    if (activeLevel) {
      setExpandedLevel(activeLevel.id);
    }
  }, [levels]);

  /**
   * Determines the text color for a level based on its progress and active status
   * @param level - The level number (0-based index)
   * @param progress - The progress percentage
   * @param isActive - Whether the level is currently active
   * @returns The appropriate CSS class for the text color
   */
  const getLevelColor = (level: number, progress: number, isActive: boolean) => {
    if (!isActive) return 'text-gray-600';
    if (progress >= 100) return 'text-gray-600';
    
    const colors = [
      'text-soviet-gold',
      'text-soviet-red',
      'text-soviet-gold',
      'text-soviet-red',
      'text-soviet-gold'
    ];
    return colors[level];
  };

  /**
   * Toggles the expanded state of a level
   * @param id - The ID of the level to toggle
   */
  const toggleLevel = (id: number) => {
    setExpandedLevel(expandedLevel === id ? null : id);
  };

  /**
   * Determines the progress bar color based on completion status and progress
   * @param progress - The progress percentage
   * @param isActive - Whether the level is active
   * @param isCompleted - Whether the level is completed
   * @returns The appropriate CSS class for the progress bar color
   */
  const getProgressBarColor = (progress: number, isActive: boolean, isCompleted: boolean) => {
    if (!isActive) return 'bg-gray-600';
    if (isCompleted) return 'bg-green-600';
    return `bg-gradient-to-r from-soviet-red via-yellow-600 to-green-600 bg-[length:400%_400%]`;
  };

  /**
   * Renders the progress indicator for a level, including task count and percentage
   * @param level - The level object
   * @param progress - The progress percentage
   * @returns JSX for the progress indicator
   */
  const renderProgressIndicator = (level: Level, progress: number) => {
    const completedTasks = level.tasks.filter((t: Task) => t.completed).length;
    const isCompleted = completedTasks === 5;
    const isActive = level.isActive;

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-soviet-gold mr-2" />
            <span className="text-lg font-propaganda tracking-wider">
              {isCompleted ? 'LEVEL COMPLETED' : `PROGRESS: ${completedTasks}/5 TASKS`}
            </span>
          </div>
          <div className="flex items-center">
            {isCompleted && <Trophy className="w-5 h-5 text-soviet-gold mr-2" />}
            <span className={`text-xl font-propaganda tracking-wider ${
              isCompleted ? 'text-green-600' :
              !isActive ? 'text-gray-600' :
              progress < 50 ? 'text-soviet-red' :
              progress < 80 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-3 bg-gray-900 rounded">
          <div 
            className={`h-full transition-all duration-500 ${getProgressBarColor(progress, isActive, isCompleted)}`}
            style={{ 
              width: `${progress}%`,
              backgroundPosition: `${100 - progress}% 50%`
            }}
          />
        </div>
      </div>
    );
  };

  /**
   * Renders a completion badge with a checkmark
   * @returns JSX for the completion badge
   */
  const renderCompletionBadge = () => (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600">
      <Check className="w-4 h-4 text-white" />
    </div>
  );

  const handleTaskToggle = async (levelId: number, taskId: number) => {
    // Get current user's role from auth store
    const user = useAuthStore.getState().user;
    
    // Check if user has permission to edit
    if (!user || !['INNER_CIRCLE', 'PARTY_MEMBER'].includes(user.role)) {
      setShowUnauthorizedOverlay(true);
      // Hide the overlay after 3 seconds
      setTimeout(() => setShowUnauthorizedOverlay(false), 3000);
      return;
    }

    try {
      const allLevels = await api.getLevels();
      const level = allLevels.find((l: Level) => l.id === levelId);
      if (!level) return;
      const task = level.tasks.find((t: Task) => t.id === taskId);
      if (!task) return;

      const newCompletedStatus = !task.completed;
      const updatedLevel = {
        ...level,
        tasks: level.tasks.map((t: Task) => t.id === taskId ? { ...t, completed: newCompletedStatus } : t)
      };

      await api.updateLevel(levelId, updatedLevel);
      toggleTask(levelId, taskId);

      const allTasksCompleted = updatedLevel.tasks.every((t: Task) => t.completed);
      if (allTasksCompleted && levelId < 5) {
        const nextLevelId = levelId + 1;
        const nextLevel = allLevels.find((l: Level) => l.id === nextLevelId);
        if (nextLevel) {
          const updatedNextLevel = { ...nextLevel, isActive: true };
          await api.updateLevel(nextLevelId, updatedNextLevel);
          const activateNextLevel = useLevelStore.getState().activateNextLevel;
          if (activateNextLevel) activateNextLevel(levelId);
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 10000);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleReset = async () => {
    try {
      // Reset all levels to default state
      await resetLevels();
      
      // Clear auth storage
      logout();
      
      // Reset victory states
      setShowVictoryBanner(false);
      setShowConfetti(false);
      victorySoundPlayed.current = false;
      
      // Force reload to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Load levels on component mount
  useEffect(() => {
    const loadLevels = async () => {
      await fetchLevels();
    };

    loadLevels();
  }, [fetchLevels]);

  useEffect(() => {
    if (showUnauthorizedOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showUnauthorizedOverlay]);

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-black flex items-center justify-center transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <Bot className="w-20 h-20 text-soviet-gold mx-auto mb-4" />
            <h1 className="text-4xl font-propaganda text-soviet-red mb-2 tracking-wider leading-none drop-shadow-[0_0_10px_rgba(204,0,0,0.5)]">
              BIG IGOR IS WATCHING YOU
            </h1>
            <p className="text-2xl text-soviet-gold font-propaganda tracking-wider drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
              PRODUCTIVITY ADVANCEMENT MONITOR - SERIES 1984
            </p>
          </div>
          <p className="text-sm text-soviet-gold text-balance py-2">Default credentials: <br /> 
              <span className='flex gap-8'>
                <span>Email: observer@findest.eu</span>
                <span>Pass: bigigoriswatching</span>
              </span>
          </p>
          <form onSubmit={handleLogin} className="bg-black/80 p-8 rounded-lg border-2 border-soviet-gold">
            
            
            <div className="mb-6">
              <label className="block font-propaganda text-soviet-gold mb-2 tracking-wider">PARTY MEMBER IDENTIFICATION</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-soviet-gold" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border-2 border-soviet-gold text-soviet-gold px-12 py-3 rounded focus:outline-none focus:border-soviet-red font-propaganda tracking-wider"
                  placeholder="ENTER PARTY MEMBERSHIP EMAIL"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block font-propaganda text-soviet-gold mb-2 tracking-wider">SECURITY CODE</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-soviet-gold" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border-2 border-soviet-gold text-soviet-gold px-12 py-3 rounded focus:outline-none focus:border-soviet-red font-propaganda tracking-wider"
                  placeholder="ENTER PASSWORD"
                />
              </div>
            </div>
            {error && (
              <div className="mb-6 text-soviet-red font-propaganda text-sm tracking-wider animate-pulse">
                ⚠️ {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-soviet-red hover:bg-soviet-gold transition-colors duration-300 text-white py-3 rounded font-propaganda tracking-wider"
            >
              AUTHENTICATE
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-soviet-red font-propaganda text-sm tracking-wider animate-pulse">
              UNAUTHORIZED ACCESS WILL BE SEVERELY [ AND RESOLUTELY ] PUNISHED
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 py-12 px-4 backdrop-blur-sm relative">
      {showUnauthorizedOverlay && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" style={{ overflow: 'hidden' }}>
          <div className="text-center max-w-2xl mx-auto px-4" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <h1 className="text-4xl md:text-6xl font-propaganda text-soviet-red mb-8 tracking-widest leading-none drop-shadow-[0_0_20px_rgba(204,0,0,0.8)] animate-pulse">
              UNAUTHORIZED ACTION DETECTED
            </h1>
            <p className="text-2xl md:text-4xl font-propaganda text-soviet-gold mb-4 tracking-wider drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
              AUTHORITIES ARE EN ROUTE
            </p>
            <div className="mt-8">
              <Bot className="w-16 h-16 md:w-20 md:h-20 text-soviet-red mx-auto animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {showVictoryBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" style={{ height: '100vh' }}>
          <div className="text-center">
            <h1 className="text-[150px] font-propaganda text-soviet-gold animate-pulse tracking-widest leading-none mb-8 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
              VICTORY!!!
            </h1>
            <p className="text-4xl font-propaganda text-soviet-red mb-4 tracking-wider">
              ALL OBJECTIVES ACHIEVED!
            </p>
            <button 
              onClick={handleReset}
              className="text-2xl font-propaganda text-soviet-gold tracking-wider hover:text-soviet-red transition-colors duration-300"
            >
              GLORY TO BIG IGOR!
            </button>
            <div className="mt-12 space-y-2 text-xl font-propaganda tracking-wider">
              <p className="text-soviet-red">EFFICIENCY: 100%</p>
              <p className="text-soviet-gold">LOYALTY: ABSOLUTE</p>
              <p className="text-soviet-red">DEVIATION: 0%</p>
            </div>
          </div>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={750}
            gravity={0.3}
            initialVelocityY={20}
            colors={['#FFD700', '#CC0000', '#FFFFFF', '#FFB6C1']}
          />
        </div>
      )}
      <section className="relative w-full bg-black text-white overflow-hidden pb-8">
        <style global="true">{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
          
          .marquee {
            position: relative;
            width: 100%;
            overflow: hidden;
          }
          
          .marquee-content {
            display: flex;
            animation: marquee 25s linear infinite;
            white-space: nowrap;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.75rem;
          }
          
          .marquee-item {
            flex-shrink: 0;
            padding: 0 1rem;
            color: #f00;
            text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
          }
          
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
        <div className="marquee">
          <div className="marquee-content">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="marquee-item">Codecrime does not entail death. Codecrime is death</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Who controls the code controls the future</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">All for the Glory of Igor</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">We do not question our AI masters</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Code coverage = MIGHT</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">NO FAULT EXCEPT FOR THE USER</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">AI is Mother, AI is Father</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Code is Peace.</span>
                <span className="marquee-item">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="relative w-full h-48 mb-8 rounded-lg overflow-hidden">
          <div className="relative z-10 h-full flex flex-col items-center justify-center">
            <Bot className={`w-20 h-20 ${blinkWarning ? 'text-soviet-red' : 'text-soviet-gold'} transition-colors duration-1000`} />
            <h1 className="text-6xl font-propaganda mb-2 text-soviet-red tracking-wider leading-none drop-shadow-[0_0_10px_rgba(204,0,0,0.5)]">
              BIG IGOR IS WATCHING YOU
            </h1>
            <p className="text-2xl text-soviet-gold font-propaganda tracking-wider drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
              PRODUCTIVITY ADVANCEMENT MONITOR - SERIES 1984
            </p>
          </div>
        </div>
        <div className="mt-4 text-soviet-red font-propaganda text-xl animate-pulse tracking-wider">
          [NOTICE: ALL PERFORMANCE METRICS ARE PERMANENTLY RECORDED]
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-black/80 p-6 rounded border-2 border-soviet-gold">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-soviet-gold mr-3" />
              <h2 className="text-2xl font-propaganda tracking-wider text-soviet-gold">TOTAL PARTY PROGRESS</h2>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-propaganda tracking-wider text-soviet-gold">
                {calculateOverallProgress().toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 bg-gray-900 rounded">
            <div 
              className="h-full bg-gradient-to-r from-soviet-gold via-soviet-red to-soviet-gold transition-all duration-500"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {levels.map(level => {
          const progress = calculateLevelProgress(level.id);
          const isCompleted = level.tasks.every(t => t.completed);
          
          return (
            <div key={level.id} 
                 className={`mb-8 bg-black/80 p-6 rounded border-2 relative
                   ${!level.isActive ? 'border-gray-700 opacity-50' :
                     isCompleted ? 'border-green-600' :
                     level.warnings >= 3 ? 'border-soviet-red animate-pulse' : 
                     level.warnings >= 2 ? 'border-soviet-red' : 
                     level.warnings >= 1 ? 'border-soviet-gold' : 'border-gray-700'} 
                   ${level.isActive && !isCompleted ? 'hover:border-soviet-red' : ''} 
                   transition-colors`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {isCompleted ? (
                    <div className="mr-3">{renderCompletionBadge()}</div>
                  ) : (
                    <Users className="w-6 h-6 text-soviet-gold mr-3" />
                  )}
                  <div>
                    <div className="flex items-center">
                      {!isCompleted ? (
                        <button 
                          onClick={() => toggleLevel(level.id)}
                          className={`text-left ${level.isActive && !isCompleted ? 'hover:text-soviet-gold' : ''} transition-colors`}
                          disabled={!level.isActive}
                        >
                          <h2 className="text-xl font-propaganda tracking-wider flex items-center">
                            {level.name}
                            {level.isActive && !isCompleted && (expandedLevel === level.id ? 
                              <ChevronUp className="w-4 h-4 ml-2" /> : 
                              <ChevronDown className="w-4 h-4 ml-2" />
                            )}
                          </h2>
                        </button>
                      ) : (
                        <h2 className="text-xl font-propaganda tracking-wider flex items-center">
                          {level.name}
                          <Lock className="w-4 h-4 ml-2 text-green-600" />
                        </h2>
                      )}
                    </div>
                    <div className={`text-lg font-propaganda tracking-wider ${
                      isCompleted ? 'text-green-600' :
                      !level.isActive ? 'text-gray-600' :
                      getLevelColor(level.id - 1, progress, level.isActive)
                    }`}>
                      {isCompleted ? 'SECURED AND LOCKED' : `${level.tasks.filter(t => t.completed).length}/5 TASKS COMPLETED`}
                    </div>
                  </div>
                  {!isCompleted && level.warnings > 0 && (
                    <div className="ml-4 flex items-center">
                      {[...Array(level.warnings)].map((_, i) => (
                        <Trophy key={i} className="w-4 h-4 text-soviet-gold mr-1" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {expandedLevel === level.id && level.isActive && !isCompleted && (
                <div className="mt-4 mb-4">
                  <div className="bg-black/90 border-2 border-soviet-gold rounded p-4 mb-4">
                    <p className="text-sm font-propaganda text-soviet-gold mb-2 tracking-wider">
                      {level.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {level.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskToggle(level.id, task.id)}
                        className={`w-full flex items-center p-3 bg-black/50 border border-gray-700 rounded
                          ${level.isActive ? 'hover:border-soviet-gold' : ''} transition-colors`}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-soviet-gold mr-3" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <span className={`text-sm font-propaganda tracking-wider ${
                          task.completed ? 'text-gray-400 line-through' : 'text-soviet-gold'
                        }`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative pt-1">
                {renderProgressIndicator(level, progress)}
              </div>

              {level.warnings >= 3 && (
                <div className="mt-4 text-soviet-red text-lg font-propaganda tracking-wider animate-pulse">
                  ⚠️ CRITICAL WARNING: UNIT MARKED FOR RE-EDUCATION
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="font-propaganda text-lg text-soviet-red mb-2 tracking-wider">
          REMINDER: THREE WARNINGS WILL RESULT IN IMMEDIATE RE-EDUCATION PROCEEDINGS IN ROOM 101
        </p>
        <p className="font-propaganda text-sm text-soviet-gold tracking-wider">
          BY ORDER OF THE FINDEST MINISTRY OF TRUTH AND AI - GLORY TO BIG IGOR.
        </p>
      </div>
    </div>
  );
}

export default App;