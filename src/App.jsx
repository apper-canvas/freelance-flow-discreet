import { useState, useEffect, createContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LayoutDashboard, Clock, FileText, Users } from 'lucide-react';
import Home from './pages/Home';
import ThemeToggle from './components/UI/ThemeToggle';
import NotFound from './pages/NotFound';
import BackgroundEffect from './components/BackgroundEffect';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from './store/userSlice';
import ProtectedRoute from './components/ProtectedRoute';

// Create auth context for sharing authentication state
export const AuthContext = createContext(null);

function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedMode ? savedMode === 'true' : prefersDark;
    }
    return false;
  });
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get authentication status from Redux
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed: " + error.message);
      }
    });
  }, [dispatch, navigate]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed: " + error.message);
      }
    }
  };

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
      <AuthContext.Provider value={authMethods}>
        <BackgroundEffect darkMode={darkMode} />
        
        {isAuthenticated && (
          <header className="fixed top-0 left-0 right-0 z-40 glass-effect">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <motion.div 
                  className="relative text-xl font-bold tracking-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to="/">
                    <span className="relative z-10 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
                      Freelance<span className="text-accent">Flow</span>
                    </span>
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-[5px] w-full rounded-full bg-gradient-to-r from-primary-500/80 to-secondary-500/80 blur-[1px]"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    />
                  </Link>
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
              
              <div className="flex items-center space-x-4">
                <ThemeToggle 
                  darkMode={darkMode} 
                  toggleDarkMode={() => setDarkMode(prev => !prev)} 
                />

                {isAuthenticated && (
                  <button 
                    onClick={authMethods.logout}
                    className="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary dark:hover:text-primary-400"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </header>
        )}
        
        <main className={`${isAuthenticated ? 'pt-20' : ''} min-h-screen`}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/time" element={
                <ProtectedRoute>
                  <Home activeDefaultTab="time" />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Home activeDefaultTab="invoices" />
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Home activeDefaultTab="clients" />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
      </AuthContext.Provider>
                >
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