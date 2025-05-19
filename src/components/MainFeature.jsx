import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import EditProjectModal from './EditProjectModal';

// Import icons through iconUtils
const CheckIcon = getIcon('check-circle');
const ClockIcon = getIcon('clock');
const PlayIcon = getIcon('play');
const PauseIcon = getIcon('pause');
const StopIcon = getIcon('square');
const PlusIcon = getIcon('plus');
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
  { id: 1, name: 'Website Redesign', client: 'Acme Corp' },
  { id: 2, name: 'Mobile App', client: 'TechStart' },
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
  const [newProject, setNewProject] = useState({
    id: null,
    name: '',
    project: '',
    task: '',
    description: '',
  });
  const [selectedProject, setSelectedProject] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [validation, setValidation] = useState({
    project: true,
    task: true,
    description: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  
  // Expose the addProject method through the ref
  useImperativeHandle(ref, () => ({
    addProject
  }));



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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user types
    if (!value.trim()) {
      setValidation(prev => ({ ...prev, [name]: false }));
    } else {
      setValidation(prev => ({ ...prev, [name]: true }));
    }
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => setIsEditModalOpen(false);

  const startTimer = () => {
    // Validate form fields
    const isProjectValid = !!newEntry.project.trim();
    const isTaskValid = !!newEntry.task.trim();
    const isDescriptionValid = !!newEntry.description.trim();
    
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
    setProjects(prev => [{id: project.id, name: project.name, client: project.client}, ...prev]);
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
              client: updatedProject.client 
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
              className="card hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">Client: {project.client}</p>
              <div className="mt-auto flex justify-end space-x-2">
                <button 
                  onClick={() => openEditModal(project)}
                  className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                >
                  <EditIcon className="h-5 w-5" title="Edit project" />
                </button>
              </div>
            </motion.div>
          ))}
          <motion.div 
            className="card border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center cursor-pointer h-full min-h-[150px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Click the '+ New Project' button at the top to create a project")}
          >
            <PlusIcon className="h-10 w-10 mb-2 text-surface-400" />
            <p className="font-medium text-surface-500">New Project</p>
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