import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, ColumnId, Priority, ProjectType } from './types';
import { COLUMNS, STORAGE_KEYS, PRIORITY_LABELS } from './constants';
import ProjectHeader from './components/ProjectHeader';
import Column from './components/kanban/Column';
import Modal from './components/ui/Modal';
import Input from './components/ui/Input';
import { Calendar, Clock, Tag, Globe, Smartphone, Layers, Search, Filter, Layout, ArrowRight } from 'lucide-react';

// Simple UUID generator to avoid external deps
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const App: React.FC = () => {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // --- App Data State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Modals State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnForNewTask, setTargetColumnForNewTask] = useState<ColumnId | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // New: Viewing Task State
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');

  // Forms State
  const [newProjectForm, setNewProjectForm] = useState<{
    name: string;
    client: string;
    costAmount: string;
    currency: string;
    timeline: string;
    projectType: ProjectType;
  }>({
    name: '',
    client: '',
    costAmount: '',
    currency: '$',
    timeline: '',
    projectType: 'Website'
  });

  const [newTaskForm, setNewTaskForm] = useState<{ title: string; description: string; priority: Priority }>({
    title: '',
    description: '',
    priority: 'Medium'
  });

  // --- Effects ---

  // Check auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('flowban_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data from LocalStorage on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const storedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const storedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);

    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects).map((p: any) => ({
        ...p,
        projectType: p.projectType || 'Website' // Migration for old data
      }));
      setProjects(parsedProjects);
      
      if (parsedProjects.length > 0) {
        // If we have a stored active ID and it exists in projects, use it. Otherwise use the first project.
        const validActiveId = parsedProjects.find((p: Project) => p.id === storedActiveId) ? storedActiveId : parsedProjects[0].id;
        setActiveProjectId(validActiveId);
      }
    } else {
        // Initialize with a demo project if empty
        const demoId = generateId();
        const demoProject: Project = {
            id: demoId,
            name: "Portfolio Website",
            clientName: "Self",
            cost: "$ 0",
            timeline: "2 Weeks",
            projectType: 'Website',
            createdAt: Date.now()
        };
        setProjects([demoProject]);
        setActiveProjectId(demoId);
        
        // Add some demo tasks
        const demoTasks: Task[] = [
            { id: generateId(), projectId: demoId, columnId: 'backlog', title: 'Design Mockups', description: 'Create Figma designs for homepage', priority: 'High', createdAt: Date.now() },
            { id: generateId(), projectId: demoId, columnId: 'resources', title: 'Hosting Credentials', description: 'Vercel login info', priority: 'Urgent', createdAt: Date.now() }
        ];
        setTasks(demoTasks);
    }

    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, [isAuthenticated]);

  // Persist data whenever it changes
  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks, isAuthenticated]);

  useEffect(() => {
    if (activeProjectId && isAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, activeProjectId);
    }
  }, [activeProjectId, isAuthenticated]);

  // Reset filters when changing projects
  useEffect(() => {
    setSearchQuery('');
    setFilterPriority('All');
  }, [activeProjectId]);

  // --- Derived State ---
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const activeProjectTasks = useMemo(() => 
    tasks.filter(t => t.projectId === activeProjectId)
  , [tasks, activeProjectId]);

  const filteredTasks = useMemo(() => {
    return activeProjectTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [activeProjectTasks, searchQuery, filterPriority]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'demo' && loginForm.password === '123456') {
      setIsAuthenticated(true);
      localStorage.setItem('flowban_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('flowban_auth');
    setLoginForm({ username: '', password: '' });
  };

  const handleSaveProject = () => {
    if (!newProjectForm.name) return;
    
    if (editingProjectId) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProjectId 
          ? {
              ...p,
              name: newProjectForm.name,
              clientName: newProjectForm.client,
              cost: `${newProjectForm.currency} ${newProjectForm.costAmount}`,
              timeline: newProjectForm.timeline,
              projectType: newProjectForm.projectType,
            }
          : p
      ));
    } else {
      // Create new project
      const newProject: Project = {
        id: generateId(),
        name: newProjectForm.name,
        clientName: newProjectForm.client,
        cost: `${newProjectForm.currency} ${newProjectForm.costAmount}`,
        timeline: newProjectForm.timeline,
        projectType: newProjectForm.projectType,
        createdAt: Date.now()
      };
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
    }

    setIsProjectModalOpen(false);
    setEditingProjectId(null);
    setNewProjectForm({ name: '', client: '', costAmount: '', currency: '$', timeline: '', projectType: 'Website' });
  };

  const openCreateProjectModal = () => {
    setEditingProjectId(null);
    setNewProjectForm({ name: '', client: '', costAmount: '', currency: '$', timeline: '', projectType: 'Website' });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = () => {
    if (!activeProject) return;

    // Parse cost to separate currency and amount
    const costParts = activeProject.cost.split(' ');
    const currency = costParts.length > 1 ? costParts[0] : '$';
    const amount = costParts.length > 1 ? costParts.slice(1).join(' ') : activeProject.cost;

    setEditingProjectId(activeProject.id);
    setNewProjectForm({
      name: activeProject.name,
      client: activeProject.clientName,
      costAmount: amount,
      currency: currency,
      timeline: activeProject.timeline,
      projectType: activeProject.projectType || 'Website'
    });
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    
    // Cleanup tasks for deleted project
    setTasks(prev => prev.filter(t => t.projectId !== id));

    if (updatedProjects.length > 0) {
      setActiveProjectId(updatedProjects[0].id);
    } else {
      setActiveProjectId(null);
    }
  };

  const handleSaveTask = () => {
    if (!newTaskForm.title) return;

    if (editingTaskId) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.id === editingTaskId 
          ? { ...t, title: newTaskForm.title, description: newTaskForm.description, priority: newTaskForm.priority }
          : t
      ));
      
      // If we are currently viewing this task, update the view as well
      if (viewingTask && viewingTask.id === editingTaskId) {
        setViewingTask({ 
           ...viewingTask, 
           title: newTaskForm.title, 
           description: newTaskForm.description, 
           priority: newTaskForm.priority 
        });
      }
    } else {
      // Create new task
      if (!activeProjectId || !targetColumnForNewTask) return;
      const newTask: Task = {
        id: generateId(),
        projectId: activeProjectId,
        columnId: targetColumnForNewTask,
        title: newTaskForm.title,
        description: newTaskForm.description,
        priority: newTaskForm.priority,
        createdAt: Date.now()
      };
      setTasks(prev => [...prev, newTask]);
    }

    // Reset and close
    setIsTaskModalOpen(false);
    setNewTaskForm({ title: '', description: '', priority: 'Medium' });
    setTargetColumnForNewTask(null);
    setEditingTaskId(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (viewingTask?.id === id) setViewingTask(null);
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedTask = { ...t, columnId: targetColumnId as ColumnId };
        if (viewingTask && viewingTask.id === t.id) {
           setViewingTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    }));
  };

  const openTaskModal = (columnId: string) => {
    setTargetColumnForNewTask(columnId as ColumnId);
    setEditingTaskId(null);
    setNewTaskForm({ title: '', description: '', priority: 'Medium' });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setIsTaskModalOpen(true);
  };

  const openViewTaskModal = (task: Task) => {
    setViewingTask(task);
  };

  // --- Render Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden">
           <div className="bg-blue-600 p-8 text-center">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 text-white mb-4 backdrop-blur-sm">
               <Layout size={32} />
             </div>
             <h1 className="text-2xl font-bold text-white tracking-tight">FlowBan</h1>
             <p className="text-blue-100 mt-2 text-sm">Project Management Simplified</p>
           </div>
           
           <div className="p-8">
             <div className="text-center mb-6">
               <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
               <p className="text-gray-500 text-sm mt-1">Please sign in to your account</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                 <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all text-sm"
                    placeholder="Enter your username"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                 <input 
                    type="password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400 transition-all text-sm"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                 />
               </div>
               
               {loginError && (
                 <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                   {loginError}
                 </div>
               )}

               <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg mt-2 group"
               >
                 <span>Sign In</span>
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
             </form>

             {/* Demo Credentials Hint */}
             <div className="mt-8 pt-6 border-t border-gray-100">
               <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-gray-600">
                 <p className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-[10px]">Demo Account</p>
                 <div className="flex justify-between items-center mb-1">
                    <span>Username:</span>
                    <span className="font-mono font-medium text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">demo</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span>Password:</span>
                    <span className="font-mono font-medium text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">123456</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900 font-sans">
      <ProjectHeader 
        currentProject={activeProject}
        projects={projects}
        onSwitchProject={setActiveProjectId}
        onAddProject={openCreateProjectModal}
        onEditProject={openEditProjectModal}
        onDeleteProject={handleDeleteProject}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {activeProject ? (
          <>
            {/* Search & Filters Toolbar */}
            <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
                  />
                </div>
                
                {/* Priority Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-gray-500 hidden sm:inline-block"><Filter size={14} className="inline mr-1"/>Filter:</span>
                  <select 
                    value={filterPriority} 
                    onChange={e => setFilterPriority(e.target.value as Priority | 'All')}
                    className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
                  >
                    <option value="All">All Priorities</option>
                    {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="h-full px-4 sm:px-6 lg:px-8 pb-6 pt-4 inline-flex gap-6 min-w-full">
                {COLUMNS.map(colDef => (
                  <Column
                    key={colDef.id}
                    definition={colDef}
                    tasks={filteredTasks.filter(t => t.columnId === colDef.id)}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onAddTask={(colId) => openTaskModal(colId)}
                    onDeleteTask={handleDeleteTask}
                    onDragStart={handleDragStart}
                    onEditTask={openEditTaskModal}
                    onViewTask={openViewTaskModal}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xl mb-4">No active projects.</p>
            <button 
              onClick={openCreateProjectModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </main>

      {/* Project Modal (Create & Edit) */}
      <Modal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        title={editingProjectId ? "Edit Project" : "Create New Project"}
      >
        <div className="space-y-4">
          <Input 
            label="Project Name" 
            placeholder="e.g. E-Commerce App" 
            value={newProjectForm.name}
            onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})}
            autoFocus
          />
          <Input 
            label="Client Name" 
            placeholder="e.g. Acme Corp"
            value={newProjectForm.client}
            onChange={e => setNewProjectForm({...newProjectForm, client: e.target.value})}
          />
          
          {/* Project Type Selection */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
             <div className="grid grid-cols-3 gap-2">
                {(['Website', 'App', 'Both'] as ProjectType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewProjectForm({...newProjectForm, projectType: type})}
                    className={`flex items-center justify-center gap-2 py-2 px-1 rounded-md text-sm font-medium border transition-all ${
                        newProjectForm.projectType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {type === 'Website' && <Globe size={16} />}
                    {type === 'App' && <Smartphone size={16} />}
                    {type === 'Both' && <Layers size={16} />}
                    {type}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <select 
                  className="bg-gray-50 border-r border-gray-300 px-3 py-2 text-gray-700 font-medium focus:outline-none text-sm"
                  value={newProjectForm.currency}
                  onChange={e => setNewProjectForm({...newProjectForm, currency: e.target.value})}
                >
                  <option value="$">$</option>
                  <option value="₹">₹</option>
                </select>
                <input
                  type="text"
                  className="w-full px-3 py-2 focus:outline-none bg-white text-gray-900 placeholder-gray-400"
                  placeholder="5,000"
                  value={newProjectForm.costAmount}
                  onChange={e => setNewProjectForm({...newProjectForm, costAmount: e.target.value})}
                />
              </div>
            </div>
            
            <Input 
              label="Timeline" 
              placeholder="e.g. 4 Weeks"
              value={newProjectForm.timeline}
              onChange={e => setNewProjectForm({...newProjectForm, timeline: e.target.value})}
            />
          </div>
          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSaveProject}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors"
            >
              {editingProjectId ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Modal (Create & Edit) */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={editingTaskId ? "Edit Card" : "Add New Card"}
      >
        <div className="space-y-4">
          <Input 
            label="Title" 
            placeholder="What needs to be done?" 
            value={newTaskForm.title}
            onChange={e => setNewTaskForm({...newTaskForm, title: e.target.value})}
            autoFocus
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 min-h-[100px] resize-none"
              placeholder="Add details..."
              value={newTaskForm.description}
              onChange={e => setNewTaskForm({...newTaskForm, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTaskForm({...newTaskForm, priority: p})}
                  className={`py-2 px-1 rounded-md text-xs font-semibold border transition-all ${
                    newTaskForm.priority === p 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
              onClick={handleSaveTask}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors"
            >
              {editingTaskId ? "Save Changes" : "Add Card"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Task Details Modal (Read Only) */}
      <Modal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        title="Card Details"
        maxWidth="max-w-3xl"
      >
        {viewingTask && (
          <div className="space-y-6">
             {/* Header Section */}
             <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${PRIORITY_LABELS[viewingTask.priority]}`}>
                    {viewingTask.priority}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(viewingTask.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingTask.title}</h2>
             </div>

             {/* Meta Info */}
             <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                   <Tag size={16} className="text-gray-400"/>
                   <span className="font-medium">Status:</span>
                   <span>{COLUMNS.find(c => c.id === viewingTask.columnId)?.title || viewingTask.columnId}</span>
                </div>
             </div>

             {/* Description */}
             <div>
               <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-2">Description</h3>
               <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap min-h-[100px]">
                 {viewingTask.description || <span className="text-gray-400 italic">No description provided.</span>}
               </div>
             </div>

             {/* Actions */}
             <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
               <button 
                 onClick={() => {
                   openEditTaskModal(viewingTask);
                   setViewingTask(null); 
                 }}
                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
               >
                 Edit Card
               </button>
               <button 
                 onClick={() => setViewingTask(null)}
                 className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
               >
                 Close
               </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;