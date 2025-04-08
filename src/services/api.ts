const BASE_URL = import.meta.env.VITE_API_URL || 'https://672c9c4b1600dda5a9f923d6.mockapi.io/api/v1'

// Add logging function
const logApiCall = (endpoint: string, method: string, status: number, data?: any) => {
  console.log(`API Call: ${method} ${endpoint}`, {
    status,
    timestamp: new Date().toISOString(),
    data: data ? JSON.stringify(data).substring(0, 100) + '...' : undefined
  });
};

export const api = {
  async getLevels() {
    console.log('Attempting to fetch levels from:', `${BASE_URL}/levels`);
    try {
      const response = await fetch(`${BASE_URL}/levels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch levels:', response.status, response.statusText);
        throw new Error(`Failed to fetch levels: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched levels:', data.length);
      return data;
    } catch (error) {
      console.error('Error fetching levels:', error);
      throw error;
    }
  },
  
  async updateLevel(levelId: string, data: any) {
    console.log(`Attempting to update level ${levelId}:`, data);
    try {
      const response = await fetch(`${BASE_URL}/levels/${levelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      logApiCall(`/levels/${levelId}`, 'PUT', response.status, data);

      if (!response.ok) {
        console.error(`Failed to update level ${levelId}:`, response.status, response.statusText);
        throw new Error(`Failed to update level: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Successfully updated level ${levelId}`);
      return result;
    } catch (error) {
      console.error(`Error updating level ${levelId}:`, error);
      throw error;
    }
  },
  
  async updateTask(levelId: string, taskId: string, completed: boolean) {
    console.log(`Attempting to update task ${taskId} in level ${levelId}:`, { completed });
    try {
      const levels = await this.getLevels();

      const level = levels.find((l: { id: string; tasks: any[] }) => l.id === levelId);
      if (!level) {
        throw new Error(`Level ${levelId} not found`);
      }

      const updatedTasks = level.tasks.map((task: { id: string; completed: boolean }) =>
        task.id === taskId ? { ...task, completed } : task
      );

      const updatedLevel = { ...level, tasks: updatedTasks };
      return this.updateLevel(levelId, updatedLevel);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  async getLevel(levelId: number) {
    console.log(`Attempting to fetch level ${levelId}`);
    try {
      const response = await fetch(`${BASE_URL}/levels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch level ${levelId}:`, response.status, response.statusText);
        throw new Error(`Failed to fetch level ${levelId}: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched level ${levelId}`);
      return data;
    } catch (error) {
      console.error(`Error fetching level ${levelId}:`, error);
      throw error;
    }
  }
} 