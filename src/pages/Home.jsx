import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import projectService from '../services/projectService';
import timeEntryService from '../services/timeEntryService';
import clientService from '../services/clientService';
import attachmentService from '../services/attachmentService';
import { useContext } from 'react';
import MainFeature from '../components/MainFeature';
import NewProjectModal from '../components/NewProjectModal';

const BarChart = getIcon('bar-chart-3');
const Clock = getIcon('clock');
const FileText = getIcon('file-text');
const Users = getIcon('users');

function Home({ activeDefaultTab = 'projects' }) {
  const [activeTab, setActiveTab] = useState(activeDefaultTab);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [stats, setStats] = useState({
    activeProjects: 0,
    trackedHours: 0,
    pendingInvoices: 0,
    totalClients: 0
  });

  const mainFeatureRef = useRef();

  // Load dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch project stats
        const projectStats = await projectService.getProjectStats();
        
        // Fetch tracked hours
        const trackedHours = await timeEntryService.getTrackedHours();
        
        // Fetch client count
        const clientCount = await clientService.getClientStats();
        
        // Update stats state
        setStats({
          activeProjects: projectStats.active || 0,
          trackedHours: trackedHours.toFixed(1) || 0,
          pendingInvoices: 0, // This would come from an invoices service
          totalClients: clientCount || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleAddProject = async (project) => {
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

      // Create the project in the database
      const createdProject = await projectService.createProject(formattedProject);

      // Upload attachments if any
      if (project.attachments && project.attachments.length > 0) {
        for (const attachment of project.attachments) {
          if (attachment.file) {
            await attachmentService.uploadAttachment(attachment.file, createdProject.Id);
          }
        }
      }

      // Add to UI through the ref
      if (mainFeatureRef.current && mainFeatureRef.current.addProject) {
        mainFeatureRef.current.addProject({
          ...project,
          id: createdProject.Id
        });
      }

      toast.success(`Project "${project.name}" created successfully`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    }
  };

  // StatCard component for dashboard stats
  const StatCard = ({ icon, title, value, iconColor, valueSuffix = '' }) => {
    const Icon = icon;
    return (
      <motion.div 
        className="card flex flex-col items-center md:items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`mb-3 rounded-full p-3 ${iconColor}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1 text-center md:text-left">{title}</h3>
        <p className="text-2xl font-bold">{value}{valueSuffix}</p>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              Track your freelance work, manage projects, and invoice clients
            </p>
          </div>
          
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewProject}
          >
            <span className="mr-2">+ New Project</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-32 animate-pulse bg-surface-100 dark:bg-surface-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={BarChart} 
              title="Active Projects" 
              value={stats.activeProjects} 
              iconColor="bg-primary"
            />
            <StatCard 
              icon={Clock} 
              title="Hours Tracked" 
              value={stats.trackedHours} 
              valueSuffix="h" 
              iconColor="bg-secondary"
            />
            <StatCard 
              icon={FileText} 
              title="Pending Invoices" 
              value={stats.pendingInvoices} 
              iconColor="bg-accent"
            />
            <StatCard 
              icon={Users} 
              title="Total Clients" 
              value={stats.totalClients} 
              iconColor="bg-primary-dark"
            />
          </div>
        )}
      </section>

      <section>
        <div className="border-b border-surface-200 dark:border-surface-700 mb-8">
          <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
            {['projects', 'time', 'invoices', 'clients'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary dark:text-primary-light'
                    : 'border-transparent text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MainFeature activeTab={activeTab} ref={mainFeatureRef} />
          </motion.div>
        </AnimatePresence>

        <NewProjectModal 
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onAddProject={handleAddProject}
        />
      </section>
    </div>
  );
}

export default Home;