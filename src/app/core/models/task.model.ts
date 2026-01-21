export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface TaskUser {
  id: number;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;

  createdAt: string;
  updatedAt: string;

  user: TaskUser;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;

  targetUserId?: number;
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;
