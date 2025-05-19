import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

function NotFound() {
  const AlertTriangle = getIcon('alert-triangle');
  const ArrowLeft = getIcon('arrow-left');

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-accent/10 dark:bg-accent/20 p-5 rounded-full">
            <AlertTriangle className="h-16 w-16 text-accent" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="inline-flex items-center btn-primary"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFound;