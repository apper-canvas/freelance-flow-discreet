import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify'; 
import { getIcon } from '../utils/iconUtils';
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

const initialTimeEntries = [
  {
    id: 1,
    project: 'Website Redesign',
    client: 'Acme Corp',
    task: 'Homepage Layout',
    description: 'Creating responsive layout for the homepage',
    startTime: new Date(Date.now() - 60 * 60 * 1000),
    endTime: new Date(),
    duration: 60, // minutes
  },
  {
    id: 2,
    project: 'Mobile App',
    client: 'TechStart',
    task: 'UI Design',
    description: 'Designing user profiles screen',
    startTime: new Date(Date.now() - 120 * 60 * 1000),
    endTime: new Date(Date.now() - 60 * 60 * 1000),
    duration: 60, // minutes
  }
];

const initialProjects = [
  { id: 1, name: 'Website Redesign', client: 'Acme Corp', startDate: new Date(), manager: 'John Doe', status: 'in-progress', priority: 'high', budget: 15000, description: 'Complete website redesign with new branding' },
  { id: 2, name: 'Mobile App', client: 'TechStart', startDate: new Date(), manager: 'Jane Smith', status: 'pending', priority: 'medium', budget: 25000, description: 'New mobile app for iOS and Android platforms' },
  { id: 3, name: 'Logo Design', client: 'Local Cafe' },
];

// Convert to use forwardRef to accept the ref from parent
const MainFeature = forwardRef(({ activeTab }, ref) => {
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries);
  const [projects, setProjects] = useState(initialProjects);
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

  const handleViewProject = (project) => {
    toast.info(`Viewing project: ${project.name}`);
  };

  const handleEditProject = (project) => {
    openEditModal(project);
  };
  
  const handleDeleteProject = (id) => {
    toast.info("Delete functionality will be implemented soon");
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

  const stopTimer = () => {
    // Create new time entry
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
  };

  const deleteTimeEntry = (id) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success("Time entry deleted");
  };

  const addProject = (project) => {
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
    toast.success(`Project "${project.name}" created successfully!`);
  };

  const editProject = (updatedProject) => {
    try {
      setProjects(prevProjects => 
        prevProjects.map(proj => 
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
        )
      );
      toast.success(`Project "${updatedProject.name}" updated successfully!`);
    } catch (error) {
      toast.error("Failed to update project. Please try again.");
    }
  };

  if (activeTab === 'projects') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
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
        </div>
        
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
                      No time entries yet. Start tracking your time!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  
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

  if (activeTab === 'clients') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div 
              key={project.id}
              className="card hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mr-4">
                  {project.client.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{project.client}</h3>
                  <p className="text-surface-500 dark:text-surface-400 text-sm">1 Project</p>
                </div>
              </div>
              <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mt-4">
                <p className="text-sm font-medium">Active Project:</p>
                <p className="text-surface-500 dark:text-surface-400">{project.name}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-primary text-sm font-medium">View Details</button>
              </div>
            </motion.div>
          ))}
          <motion.div 
            className="card border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center cursor-pointer h-full min-h-[150px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Add new client feature coming soon!")}
          >
            <PlusIcon className="h-10 w-10 mb-2 text-surface-400" />
            <p className="font-medium text-surface-500">New Client</p>
          </motion.div>
        </div>
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