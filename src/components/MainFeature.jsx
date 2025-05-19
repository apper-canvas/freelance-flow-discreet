import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify'; 
import projectService from '../services/projectService';
import timeEntryService from '../services/timeEntryService';
import clientService from '../services/clientService';
import teamMemberService from '../services/teamMemberService';
import attachmentService from '../services/attachmentService';
import { getIcon, FileIcon } from '../utils/iconUtils';
import EditProjectModal from './EditProjectModal';

// Import icons through iconUtils
const CheckIcon = getIcon('check-circle');
const ClockIcon = getIcon('clock');
const PlayIcon = getIcon('play');
const PauseIcon = getIcon('pause');
const StopIcon = getIcon('square');
const PlusIcon = getIcon('plus');
const EyeIcon = getIcon('eye');
const TrashIcon = getIcon('trash-2');
const EditIcon = getIcon('edit');

// Convert to use forwardRef to accept the ref from parent
const MainFeature = forwardRef(({ activeTab }, ref) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState({
    projects: false,
    timeEntries: false,
    clients: false
  });
  const [error, setError] = useState({
    projects: null,
    timeEntries: null,
    clients: null
  });
  const [newEntry, setNewEntry] = useState({
    project: '',
    task: '',
    description: '',
  });
  const [timer, setTimer] = useState(0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [validation, setValidation] = useState({
    project: true,
    task: true,
    description: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  // Load data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'projects') {
        await fetchProjects();
      } else if (activeTab === 'time') {
        await fetchTimeEntries();
        // Also need projects for the dropdown
        if (projects.length === 0) {
          await fetchProjects();
        }
      } else if (activeTab === 'clients') {
        await fetchClients();
      }
    };

    fetchData();
  }, [activeTab]);

  const fetchProjects = async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    setError(prev => ({ ...prev, projects: null }));
    
    try {
      const data = await projectService.getProjects();
      // Transform data to match component's expected format
      const formattedProjects = data.map(project => ({
        id: project.Id,
        name: project.Name,
        client: project.client,
        description: project.description,
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        manager: project.manager,
        teamMembers: project.teamMembers?.split(',') || [],
        priority: project.priority || 'medium',
        status: project.status || 'pending',
        budget: project.budget || 0,
        tags: project.Tags?.split(',') || [],
        attachments: project.attachments || []
      }));
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(prev => ({ ...prev, projects: "Failed to load projects" }));
      toast.error("Failed to load projects. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchTimeEntries = async () => {
    setLoading(prev => ({ ...prev, timeEntries: true }));
    setError(prev => ({ ...prev, timeEntries: null }));
    
    try {
      const data = await timeEntryService.getTimeEntries();
      // Transform data to match component's expected format
      const formattedEntries = data.map(entry => ({
        id: entry.Id,
        project: entry.project,
        client: entry.client,
        task: entry.task,
        description: entry.description,
        startTime: entry.startTime ? new Date(entry.startTime) : null,
        endTime: entry.endTime ? new Date(entry.endTime) : null,
        duration: entry.duration || 0
      }));
      
      setTimeEntries(formattedEntries);
    } catch (err) {
      console.error("Error fetching time entries:", err);
      setError(prev => ({ ...prev, timeEntries: "Failed to load time entries" }));
      toast.error("Failed to load time entries. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, timeEntries: false }));
    }
  };

  const fetchClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    setError(prev => ({ ...prev, clients: null }));
    
    try {
      const data = await clientService.getClients();
      // Get projects for each client to display active projects
      const clientsWithProjects = [];
      
      for (const client of data) {
        // Find projects for this client
        const clientProjects = projects.filter(p => p.client === client.Name);
        
        clientsWithProjects.push({
          id: client.Id,
          name: client.Name,
          projects: clientProjects
        });
      }
      
      setClients(clientsWithProjects);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(prev => ({ ...prev, clients: "Failed to load clients" }));
      toast.error("Failed to load clients. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);
  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Helper function to get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on-hold':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to get team members display
  const getTeamMembersDisplay = (members) => {
    if (!members || members.length === 0) return 'No team members';
    return members.join(', ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  // Expose the addProject method through the ref
  useImperativeHandle(ref, () => ({
    addProject
  }));

  const handleViewProject = async (project) => {
    // Fetch the latest project data to view
    await projectService.getProjectById(project.id);
    toast.info(`Viewing project: ${project.name}`);
  };

  const handleEditProject = (project) => {
    openEditModal(project);
  };
  
  const handleDeleteProject = async (id) => {
    try {
      // Confirm before deleting
      if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        await projectService.deleteProject(id);
        setProjects(prev => prev.filter(project => project.id !== id));
        toast.success("Project deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
  };
  };

  const handleNewProject = () => {
    toast.info("Click the '+ New Project' button at the top to create a project");
  };

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');
  };

  const startTimer = () => {
    // Validate fields
    const isProjectValid = !!newEntry.project;
    const isTaskValid = !!newEntry.task;
    const isDescriptionValid = !!newEntry.description;
    
    setValidation({
      project: isProjectValid,
      task: isTaskValid,
      description: isDescriptionValid,
    });
    
    if (isProjectValid && isTaskValid && isDescriptionValid) {
      setIsTimerRunning(true);
      toast.info("Timer started!");
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    toast.info("Timer paused");
  };

  const stopTimer = async () => {
    setLoading(prev => ({ ...prev, timeEntries: true }));
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - (timer * 1000));
    const newTimeEntry = {
      id: Date.now(),
      project: newEntry.project,
      client: projects.find(p => p.name === newEntry.project)?.client || 'Unknown',
      task: newEntry.task,
      description: newEntry.description,
      startTime,
      endTime,
      duration: Math.ceil(timer / 60), // round up to nearest minute
    };

    try {
      // Format for the service
      const timeEntryData = {
        Name: `${newEntry.project} - ${newEntry.task}`,
        project: projects.find(p => p.name === newEntry.project)?.id || null,
        task: newEntry.task,
        description: newEntry.description,
        startTime,
        endTime,
        duration: Math.ceil(timer / 60)
      };

      // Save to the database
      const savedEntry = await timeEntryService.createTimeEntry(timeEntryData);

      // Add to UI
      newTimeEntry.id = savedEntry.Id;
      setTimeEntries(prev => [newTimeEntry, ...prev]);
      
      setIsTimerRunning(false);
      setTimer(0);
      toast.success("Time entry saved!");
      
      // Reset form
      setNewEntry({
        project: '',
        task: '',
        description: '',
      });
    } catch (error) {
      console.error("Error saving time entry:", error);
      toast.error("Failed to save time entry. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, timeEntries: false }));
    }
  };

  const deleteTimeEntry = (id) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success("Time entry deleted");
  };

  const addProject = async (project) => {
    try {
      // Format the project data according to the service requirements
      const formattedProject = {
        Name: project.name,
        client: project.client,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        manager: project.manager,
        priority: project.priority,
        status: project.status,
        budget: project.budget,
        Tags: project.tags ? project.tags.join(',') : ''
      };

      // Add locally for UI update
      setProjects(prev => [{
        id: project.id,
        name: project.name,
        client: project.client,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        manager: project.manager,
      teamMembers: project.teamMembers,
      priority: project.priority,
      status: project.status,
      budget: project.budget,
      tags: project.tags,
      attachments: project.attachments
    }, ...prev]);

      toast.success(`Project "${project.name}" added successfully!`);
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project. Please try again.");
    }
  };

  const editProject = async (updatedProject) => {
    try {
      // Format the project data for the service
      const formattedProject = {
        Name: updatedProject.name,
        client: updatedProject.client,
        description: updatedProject.description,
        startDate: updatedProject.startDate,
        endDate: updatedProject.endDate,
        manager: updatedProject.manager,
        priority: updatedProject.priority,
        status: updatedProject.status,
        budget: updatedProject.budget,
        Tags: updatedProject.tags ? updatedProject.tags.join(',') : ''
      };

      // Update in the database
      await projectService.updateProject(updatedProject.id, formattedProject);

      // Update locally for UI
      setProjects(prevProjects => prevProjects.map(proj => 
        proj.id === updatedProject.id 
          ? { 
              ...proj,
              name: updatedProject.name,
              client: updatedProject.client,
              description: updatedProject.description,
              startDate: updatedProject.startDate,
              endDate: updatedProject.endDate,
              manager: updatedProject.manager,
              teamMembers: updatedProject.teamMembers,
              priority: updatedProject.priority,
              status: updatedProject.status,
              budget: updatedProject.budget,
              tags: updatedProject.tags,
              attachments: updatedProject.attachments
            } 
            : proj
      ));
      
      toast.success(`Project "${updatedProject.name}" updated successfully!`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project. Please try again.");
    }
  };

  if (activeTab === 'projects') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        
        {loading.projects ? (
          // Loading state for projects
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-64 animate-pulse">
                <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded"></div>
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded"></div>
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded"></div>
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded"></div>
                </div>
                <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error.projects ? (
          // Error state for projects
          <div className="text-center py-10">
            <p className="text-red-500 dark:text-red-400 mb-4">{error.projects}</p>
            <button className="btn-primary" onClick={fetchProjects}>Try Again</button>
          </div>
        ) : projects.length === 0 ? (
          // Empty state for projects
          <div className="text-center py-10">
            <p className="text-surface-500 dark:text-surface-400 mb-4">No projects found. Create your first project to get started!</p>
            <button className="btn-primary" onClick={() => toast.info("Create a new project")}>Create Project</button>
          </div>
        ) : (
          // Projects list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
            <motion.div 
              key={project.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div 
                className="absolute inset-0 bg-primary/5 dark:bg-primary-800/20 rounded-2xl -z-10"
                layoutId={`bg-${project.id}`}
                initial={{ borderRadius: 16 }}
                transition={{ layout: { duration: 0.3 } }}
              />
              
              <div className="neu-card flex flex-col p-5">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <p className="text-surface-600 dark:text-surface-300 mt-1">Client: {project.client}</p>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                      className="btn-ghost px-3 py-1.5 text-sm"
                      onClick={() => handleViewProject(project)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1.5" />
                      View
                    </button>
                    <button
                      className="btn-ghost px-3 py-1.5 text-sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <EditIcon className="h-4 w-4 mr-1.5" />
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-lg text-sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <TrashIcon className="h-4 w-4 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="block text-surface-500 dark:text-surface-400">Timeline:</span>
                    <span>{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-surface-500 dark:text-surface-400">Manager:</span>
                    <span>{project.manager || 'Not assigned'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-surface-500 dark:text-surface-400">Budget:</span>
                    <span>{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="block text-surface-500 dark:text-surface-400">Team:</span>
                    <span className="truncate">{getTeamMembersDisplay(project.teamMembers)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status ? project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending'}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'} Priority
                  </div>
                  {project.tags && project.tags.map((tag, index) => (
                    <div key={index} className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2.5 py-1 rounded-full text-xs">
                      {tag}
                    </div>
                  ))}
                </div>

                {project.description && (
                  <div className="mt-2">
                    <p className="text-surface-600 dark:text-surface-300 text-sm">{project.description}</p>
                  </div>
                )}

                {project.attachments && project.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-surface-500 mb-2">Attachments ({project.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {project.attachments.slice(0, 3).map((attachment, index) => (
                        <div key={index} className="flex items-center text-xs bg-surface-100 dark:bg-surface-700 rounded px-2 py-1">
                          <FileIcon className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[100px]">{attachment.name}</span>
                        </div>
                      ))}
                      {project.attachments.length > 3 && (
                        <div className="text-xs bg-surface-100 dark:bg-surface-700 rounded px-2 py-1">
                          +{project.attachments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
             </motion.div>
          ))}
          <motion.div 
            className="glass-card border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center cursor-pointer h-full min-h-[180px] relative overflow-hidden group"
            whileHover={{ 
              scale: 1.03,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.2 }
            }}
            onClick={() => toast.info("Click the '+ New Project' button at the top to create a project")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-600/20 dark:to-secondary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <motion.div 
              className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <PlusIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </motion.div>
            <p className="font-medium text-surface-600 dark:text-surface-300 mt-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">New Project</p>
            <p className="text-surface-400 dark:text-surface-500 text-sm mt-1 max-w-[80%] text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">Start tracking a new client project</p>
          </motion.div>
        </div>,

        {/* Edit Project Modal */}
        <EditProjectModal 
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          project={currentProject}
          onSave={editProject}
        />
      </div>
    );
  }

  // Time Tracking Tab Display
  if (activeTab === 'time') {
    return (
      <div className="space-y-8">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Time Tracker</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="project" className="label">Project *</label>
                <select 
                  id="project" 
                  name="project" 
                  value={newEntry.project}
                  onChange={handleInputChange}
                  className={`input ${!validation.project ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.name}>{project.name}</option>
                  ))}
                </select>
                {!validation.project && (
                  <p className="mt-1 text-sm text-red-500">Project is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="task" className="label">Task *</label>
                <input 
                  type="text" 
                  id="task" 
                  name="task" 
                  placeholder="What are you working on?"
                  value={newEntry.task}
                  onChange={handleInputChange}
                  className={`input ${!validation.task ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {!validation.task && (
                  <p className="mt-1 text-sm text-red-500">Task is required</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="label">Description *</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  placeholder="Add details about this task"
                  value={newEntry.description}
                  onChange={handleInputChange}
                  className={`input ${!validation.description ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {!validation.description && (
                  <p className="mt-1 text-sm text-red-500">Description is required</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <div className="flex items-center mb-4 md:mb-0">
              <ClockIcon className="h-6 w-6 mr-2 text-primary" />
              <span className="text-2xl font-mono font-semibold">{formatTime(timer)}</span>
            </div>
            
            <div className="flex space-x-3">
              {!isTimerRunning ? (
                <motion.button
                  onClick={startTimer}
                  className="btn bg-primary text-white px-5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isTimerRunning}
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  Start
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={pauseTimer}
                    className="btn bg-accent text-white px-5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PauseIcon className="h-5 w-5 mr-2" />
                    Pause
                  </motion.button>
                  <motion.button
                    onClick={stopTimer}
                    className="btn bg-red-500 text-white px-5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <StopIcon className="h-5 w-5 mr-2" />
                    Stop
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Time Entries List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Time Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              {loading.timeEntries ? (
                // Loading skeleton for time entries
                <tbody>
                  {[...Array(3)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="p-4"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded"></div></td>
                      <td className="p-4"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded"></div></td>
                      <td className="p-4"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded"></div></td>
                      <td className="p-4"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded"></div></td>
                      <td className="p-4"><div className="h-6 bg-surface-200 dark:bg-surface-700 rounded"></div></td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <>
              <thead className="bg-surface-100 dark:bg-surface-800 text-left">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold">Project / Task</th>
                  <th className="px-6 py-3 text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-sm font-semibold">Duration</th>
                  <th className="px-6 py-3 text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {timeEntries.map(entry => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-surface-800"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{entry.project}</div>
                      <div className="text-sm text-surface-500 dark:text-surface-400">{entry.task}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{entry.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{entry.duration} min</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{format(entry.startTime, 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-surface-500 dark:text-surface-400">
                        {format(entry.startTime, 'h:mm a')} - {format(entry.endTime, 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => deleteTimeEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {timeEntries.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-surface-500 dark:text-surface-400">
                      {error.timeEntries ? error.timeEntries : "No time entries yet. Start tracking your time!"}
                    </td>
                  </tr>
                )}
              </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  }
  
  // Invoices Tab Display
  if (activeTab === 'invoices') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Invoices</h2>
        <p className="text-surface-500 dark:text-surface-400">
          Track all your invoices and get paid for your work. Generate professional invoices based on your time entries.
        </p>
        
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-12 text-center">
          <img 
            src="https://burst.shopifycdn.com/photos/business-desk-flatlay.jpg?width=500&format=pjpg&exif=0&iptc=0" 
            alt="Invoice illustration" 
            className="w-48 h-48 object-cover mx-auto mb-6 rounded-full"
          />
          <h3 className="text-xl font-medium mb-2">Create Your First Invoice</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6 max-w-md mx-auto">
            Turn your tracked time into professional invoices to send to your clients.
          </p>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.info("Invoice generation feature coming soon!")}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Invoice
          </motion.button>
        </div>
      </div>
    );
  }

  // Clients Tab Display
  if (activeTab === 'clients') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Clients</h2>
        
        {loading.clients ? (
          // Loading state for clients
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-48 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 mr-4"></div>
                  <div>
                    <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-px bg-surface-200 dark:bg-surface-700 my-4"></div>
                <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-48"></div>
              </div>
            ))}
          </div>
        ) : error.clients ? (
          // Error state for clients
          <div className="text-center py-10">
            <p className="text-red-500 dark:text-red-400 mb-4">{error.clients}</p>
            <button className="btn-primary" onClick={fetchClients}>Try Again</button>
          </div>
        ) : clients.length === 0 ? (
          // Empty state for clients
          <div className="text-center py-10">
            <p className="text-surface-500 dark:text-surface-400 mb-4">No clients found. Create your first client when you create a project!</p>
            <button className="btn-primary" onClick={handleNewProject}>Create Project</button>
          </div>
        ) : (
          // Clients list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <motion.div 
                key={client.id}
                className="card hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mr-4">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{client.name}</h3>
                    <p className="text-surface-500 dark:text-surface-400 text-sm">
                      {client.projects ? `${client.projects.length} Project${client.projects.length !== 1 ? 's' : ''}` : 'No Projects'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mt-4">
                  <p className="text-sm font-medium">Active Projects:</p>
                  {client.projects && client.projects.length > 0 ? (
                    client.projects.map((project, idx) => (
                      <p key={idx} className="text-surface-500 dark:text-surface-400">{project.name}</p>
                    ))
                  ) : (
                    <p className="text-surface-500 dark:text-surface-400">No active projects</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    className="text-primary text-sm font-medium"
                    onClick={() => toast.info(`Client details for ${client.name}`)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
            <motion.div 
              className="card border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center cursor-pointer h-full min-h-[150px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewProject}
            >
              <PlusIcon className="h-10 w-10 mb-2 text-surface-400" />
              <p className="font-medium text-surface-500">New Client</p>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Default return if no tab matches
  return (
    <div className="text-center py-8 text-surface-500 dark:text-surface-400">
      Select a tab to view content
    </div>
  );
});

export default MainFeature;