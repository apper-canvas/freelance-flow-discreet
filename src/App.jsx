import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LayoutDashboard, Clock, FileText, Users } from 'lucide-react';
import Home from './pages/Home';
import ThemeToggle from './components/UI/ThemeToggle';
import NotFound from './pages/NotFound';
import BackgroundEffect from './components/BackgroundEffect';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode ? savedMode === 'true' : prefersDark;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <>
      <BackgroundEffect darkMode={darkMode} />
      
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.div 
              className="relative text-xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative z-10 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
                Freelance<span className="text-accent">Flow</span>
              </span>
              <motion.div 
                className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-[1px]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </motion.div>
          </div>

          <div className="hidden md:flex space-x-2">
            <AnimatePresence mode="popLayout">
              {['dashboard', 'time', 'invoices', 'clients'].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={item === 'dashboard' ? '/' : `/${item}`}
                    className="relative px-4 py-2 rounded-lg text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="absolute inset-0 rounded-lg bg-primary-100/0 dark:bg-primary-900/0 transition-colors group-hover:bg-primary-100/50 dark:group-hover:bg-primary-900/50 -z-10"></span>
                    {item === 'dashboard' && <LayoutDashboard className="h-4 w-4" />}
                    {item === 'time' && <Clock className="h-4 w-4" />}
                    {item === 'invoices' && <FileText className="h-4 w-4" />}
                    {item === 'clients' && <Users className="h-4 w-4" />}
                    <span className="capitalize text-sm font-medium">{item}</span>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <ThemeToggle 
            darkMode={darkMode} 
            toggleDarkMode={() => setDarkMode(prev => !prev)} 
          />
        </div>
      </header>
      
      <main className="pt-20 min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
        toastClassName="rounded-lg font-medium"
      />
    </>
  );
}

export default App;