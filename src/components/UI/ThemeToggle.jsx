import { motion } from 'framer-motion';
import { Moon, Sun, Stars } from 'lucide-react';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.div
      className="relative h-10 w-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.button
        onClick={toggleDarkMode}
        className="w-10 h-10 rounded-xl relative overflow-hidden bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-sm flex items-center justify-center text-surface-800 dark:text-surface-200 shadow-md hover:shadow-lg transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle dark mode"
      >
        <motion.div
          className="absolute inset-0 bg-primary-100/50 dark:bg-primary-900/50 rounded-xl"
          initial={false}
          animate={{
            clipPath: darkMode 
              ? "circle(20% at 85% 15%)" 
              : "circle(60% at 50% 50%)",
            backgroundColor: darkMode 
              ? "rgba(15, 23, 42, 0.8)" 
              : "rgba(255, 255, 255, 0.8)",
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Sun icon */}
        <motion.div
          initial={false}
          animate={{
            scale: darkMode ? 0.5 : 1,
            opacity: darkMode ? 0 : 1,
            rotate: darkMode ? -30 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <Sun className="absolute h-5 w-5 text-amber-500" />
        </motion.div>

        {/* Moon icon */}
        <motion.div
          initial={false}
          animate={{ scale: darkMode ? 1 : 0.5, opacity: darkMode ? 1 : 0, rotate: darkMode ? 0 : 30 }}
          transition={{ duration: 0.5 }}
        >
          <Moon className="absolute h-5 w-5 text-primary-300" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

export default ThemeToggle;