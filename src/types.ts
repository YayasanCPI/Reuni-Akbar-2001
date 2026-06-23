export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  url: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'not yet' | 'on progress' | 'done';
  picId: string;
  picName?: string;
  milestone: string;
  dueDate?: string;
  createdAt: string;
  comments: Comment[];
  attachments: Attachment[];
}

export interface Stats {
  stats: { status: string; count: number }[];
  workloads: { picId: string; name: string; tasksCount: number }[];
}
