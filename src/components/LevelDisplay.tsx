import { useEffect } from 'react';
import { useLevelStore } from '../store/levelStore';

export const LevelDisplay = () => {
  const { levels, loading, error, fetchLevels } = useLevelStore();

  useEffect(() => {
    fetchLevels();
  }, []);

  if (loading) return <div>Loading levels...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {levels.map(level => (
        <div key={level.id}>
          <h2>{level.name}</h2>
          <p>{level.description}</p>
          <div>
            {level.tasks.map(task => (
              <div key={task.id}>
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => useLevelStore.getState().toggleTask(level.id, task.id)}
                />
                <span>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 