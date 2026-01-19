import { ColumnDefinition, Priority } from './types';

export const COLUMNS: ColumnDefinition[] = [
  { 
    id: 'resources', 
    title: 'Resources & Access', 
    bgBase: 'bg-slate-50', 
    bgHeader: 'bg-slate-100',
    borderColor: 'border-slate-200'
  },
  { 
    id: 'backlog', 
    title: 'Backlog', 
    bgBase: 'bg-gray-50', 
    bgHeader: 'bg-gray-100',
    borderColor: 'border-gray-200'
  },
  { 
    id: 'development', 
    title: 'In Development', 
    bgBase: 'bg-blue-50', 
    bgHeader: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  { 
    id: 'review', 
    title: 'Review', 
    bgBase: 'bg-purple-50', 
    bgHeader: 'bg-purple-100',
    borderColor: 'border-purple-200'
  },
  { 
    id: 'changes', 
    title: 'Changes Needed', 
    bgBase: 'bg-red-50', 
    bgHeader: 'bg-red-100',
    borderColor: 'border-red-200'
  },
  { 
    id: 'completed', 
    title: 'Completed', 
    bgBase: 'bg-emerald-50', 
    bgHeader: 'bg-emerald-100',
    borderColor: 'border-emerald-200'
  },
];

export const PRIORITY_COLORS: Record<Priority, string> = {
  Low: 'bg-gray-400',
  Medium: 'bg-blue-400',
  High: 'bg-orange-400',
  Urgent: 'bg-red-500',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  Low: 'text-gray-600 bg-gray-100',
  Medium: 'text-blue-700 bg-blue-100',
  High: 'text-orange-700 bg-orange-100',
  Urgent: 'text-red-700 bg-red-100',
};

export const STORAGE_KEYS = {
  PROJECTS: 'flowban_projects',
  TASKS: 'flowban_tasks',
  ACTIVE_PROJECT: 'flowban_active_project_id',
};