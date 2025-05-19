import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import NewProjectModal from '../components/NewProjectModal';

const BarChart = getIcon('bar-chart-3');
const Clock = getIcon('clock');
const FileText = getIcon('file-text');
const Users = getIcon('users');

function Home() {
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [stats, setStats] = useState({
    activeProjects: 0,
    trackedHours: 0,
    pendingInvoices: 0,
    totalClients: 0
  });

  const mainFeatureRef = useRef();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setStats({
        activeProjects: 4,
        trackedHours: 37.5,
        pendingInvoices: 2,
        totalClients: 6
      });
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // In a real app, we'd fetch different data here
  };

  const handleNewProject = () => {
    setShowNewProjectModal(true);
  };

  const handleAddProject = (project) => {
    if (mainFeatureRef.current && mainFeatureRef.current.addProject) {
      mainFeatureRef.current.addProject(project);
    }
  };

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
            <MainFeature activeTab={activeTab} ref={mainFeatureRef} />
            transition={{ duration: 0.2 }}
          >
        
        <NewProjectModal 
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onAddProject={handleAddProject}
        />
            <MainFeature activeTab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

export default Home;