import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Task } from '../../types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onDragStart, onEdit, onView }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onView(task)}
      className="group relative bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3 select-none"
    >
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${PRIORITY_COLORS[task.priority]}`} />
      
      <div className="pl-3">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_LABELS[task.priority]}`}>
            {task.priority}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-gray-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition-all"
              title="Edit task"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        <h4 className="text-gray-900 font-medium text-sm leading-tight mb-1">{task.title}</h4>
        
        {task.description && (
          <p className="text-gray-500 text-xs line-clamp-3 mt-1">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskCard;