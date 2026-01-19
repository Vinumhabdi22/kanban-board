import React, { useState } from 'react';
import { Project } from '../types';
import { ChevronDown, Plus, Trash2, Calendar, User, DollarSign, Layout, Globe, Smartphone, Layers, Pencil, LogOut } from 'lucide-react';

interface ProjectHeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSwitchProject: (projectId: string) => void;
  onAddProject: () => void;
  onEditProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onLogout: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  currentProject,
  projects,
  onSwitchProject,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onLogout
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const getProjectIcon = (type: string | undefined) => {
    switch (type) {
        case 'Website': return <Globe size={16} className="text-gray-400" />;
        case 'App': return <Smartphone size={16} className="text-gray-400" />;
        case 'Both': return <Layers size={16} className="text-gray-400" />;
        default: return <Globe size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Top Row: Switcher & Actions */}
        <div className="flex justify-between items-start md:items-center mb-6">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors"
            >
              <Layout className="text-blue-600" size={24} />
              <span>{currentProject ? currentProject.name : 'No Projects'}</span>
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">My Projects</p>
                </div>
                
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchProject(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between group hover:bg-gray-50 transition-colors ${currentProject?.id === p.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  >
                    <span className="truncate">{p.name}</span>
                    {currentProject?.id === p.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                  </button>
                ))}

                {projects.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                    No active projects
                  </div>
                )}
                
                <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                  <button
                    onClick={() => {
                      onAddProject();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                    New Project
                  </button>
                </div>
              </div>
            )}
            
            {/* Backdrop for dropdown */}
            {isDropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={onAddProject}
              className="hidden sm:flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Project
            </button>
            
            {currentProject && (
              <>
                <button
                  onClick={onEditProject}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Edit Project"
                >
                  <Pencil size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => {
                    if(window.confirm(`Are you sure you want to delete "${currentProject.name}"? This cannot be undone.`)) {
                       onDeleteProject(currentProject.id);
                    }
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}

            <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Project Metadata Details */}
        {currentProject && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
              <User size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{currentProject.clientName}</span>
            </div>
            
            {/* Project Type Display */}
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
              {getProjectIcon(currentProject.projectType)}
              <span className="font-medium text-gray-900">{currentProject.projectType || 'Website'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
              <DollarSign size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{currentProject.cost}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{currentProject.timeline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;