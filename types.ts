export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProjectType = 'Website' | 'App' | 'Both';

export type ColumnId = 
  | 'resources' 
  | 'backlog' 
  | 'development' 
  | 'review' 
  | 'changes' 
  | 'completed';

export interface Project {
  id: string;
  name: string;
  clientName: string;
  cost: string;
  timeline: string;
  projectType: ProjectType;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: ColumnId;
  title: string;
  description: string;
  priority: Priority;
  createdAt: number;
}

export interface ColumnDefinition {
  id: ColumnId;
  title: string;
  bgBase: string;
  bgHeader: string;
  borderColor: string;
}