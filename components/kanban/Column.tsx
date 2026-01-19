import React from 'react';
import { Plus } from 'lucide-react';
import { Task, ColumnDefinition } from '../../types';
import TaskCard from './TaskCard';

interface ColumnProps {
  definition: ColumnDefinition;
  tasks: Task[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onAddTask: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  definition, 
  tasks, 
  onDrop, 
  onDragOver, 
  onAddTask,
  onDeleteTask,
  onDragStart,
  onEditTask,
  onViewTask
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false);
    onDrop(e, definition.id);
  };

  return (
    <div 
      className={`flex flex-col h-full min-w-[280px] w-80 rounded-xl transition-colors duration-200 border ${definition.borderColor} ${isDragOver ? 'bg-opacity-100 ring-2 ring-blue-400 ring-inset' : 'bg-opacity-50'} ${definition.bgBase}`}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className={`p-3 rounded-t-xl flex justify-between items-center border-b ${definition.borderColor} ${definition.bgHeader}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700 text-sm">{definition.title}</h3>
          <span className="bg-white/50 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200/50">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(definition.id)}
          className="text-gray-500 hover:text-gray-800 hover:bg-white/50 p-1 rounded transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
            onEdit={onEditTask}
            onView={onViewTask}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400/50 text-sm p-4 border-2 border-dashed border-gray-200/50 rounded-lg min-h-[100px]">
            <span>Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;