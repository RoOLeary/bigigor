import { useState, useEffect } from 'react';
import { Bot, Target, Users, AlertTriangle, Trophy, ChevronDown, ChevronUp, CheckSquare, Square, Check, Lock } from 'lucide-react';
import { useLevelStore } from './store/levelStore';

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
  const [blinkWarning, setBlinkWarning] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  const levels = useLevelStore((state) => state.levels);
  const toggleTask = useLevelStore((state) => state.toggleTask);
  const calculateLevelProgress = useLevelStore((state) => state.calculateLevelProgress);
  const calculateOverallProgress = useLevelStore((state) => state.calculateOverallProgress);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkWarning(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: number, progress: number, isActive: boolean) => {
    if (!isActive) return 'text-gray-600';
    if (progress >= 100) return 'text-gray-600';
    
    const colors = [
      'text-soviet-gold',    // Level 1
      'text-soviet-red',     // Level 2
      'text-soviet-gold',    // Level 3
      'text-soviet-red',     // Level 4
      'text-soviet-gold'     // Level 5
    ];
    return colors[level];
  };

  const toggleLevel = (id: number) => {
    setExpandedLevel(expandedLevel === id ? null : id);
  };

  const getProgressBarColor = (progress: number, isActive: boolean, isCompleted: boolean) => {
    if (!isActive) return 'bg-gray-600';
    if (isCompleted) return 'bg-green-600';
    
    // Return dynamic gradient based on progress
    return `bg-gradient-to-r from-soviet-red via-yellow-600 to-green-600 bg-[length:400%_400%]`;
  };

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

  const renderCompletionBadge = () => (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600">
      <Check className="w-4 h-4 text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 py-12 px-4 backdrop-blur-sm">
      {/* Header */}
      <section className="relative w-full bg-black text-white overflow-hidden pb-8">
        <style jsx global>{`
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
                <span className="marquee-item">Codecrime does not entail death. Codecrime is death.</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Who controls the code controls the future.</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Community Events.</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">We do not questions our AI masters.</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">Code coverage = MIGHT.</span>
                <span className="marquee-item">·</span>
                <span className="marquee-item">NO FAULT EXCEPT FOR THE USER.</span>
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

      {/* Overall Progress */}
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

      {/* Levels */}
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
                        <AlertTriangle key={i} className="w-4 h-4 text-soviet-gold mr-1" />
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
                        onClick={() => toggleTask(level.id, task.id)}
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

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="font-propaganda text-lg text-soviet-red mb-2 tracking-wider">
          REMINDER: THREE WARNINGS WILL RESULT IN IMMEDIATE RE-EDUCATION PROCEEDINGS
        </p>
        <p className="font-propaganda text-sm text-soviet-gold tracking-wider">
          BY ORDER OF THE FINDEST MINISTRY OF TRUTH AND AI - GLORY TO BIG IGOR
        </p>
      </div>
    </div>
  );
}

export default App;