import { Task } from './types/task';

export interface Level {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  isActive: boolean;
  warnings: number;
}

export type { Task }; 