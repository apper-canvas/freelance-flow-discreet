import { useState } from 'react';
import { motion } from 'framer-motion';

const ThreeDButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary', // primary, secondary, accent, ghost
  disabled = false,
  size = 'md', // sm, md, lg
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Determine base style based on variant
  const getVariantClass = () => {
    switch(variant) {
      case 'primary':
        return 'bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 text-white';
      case 'secondary':
        return 'bg-gradient-to-br from-secondary-400 to-secondary-600 dark:from-secondary-500 dark:to-secondary-700 text-white';
      case 'accent':
        return 'bg-gradient-to-br from-accent-400 to-accent-600 dark:from-accent-500 dark:to-accent-700 text-white';
      case 'ghost':
        return 'bg-transparent hover:bg-surface-100/80 dark:hover:bg-surface-800/80 text-surface-700 dark:text-surface-200';
      default:
        return 'bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 text-white';
    }
  };

  // Determine size class
  const getSizeClass = () => {
    switch(size) {
      case 'sm': return 'text-sm px-3 py-1.5 rounded-lg';
      case 'lg': return 'text-lg px-6 py-3 rounded-xl';
      default: return 'px-5 py-2.5 rounded-xl';
    }
  };

  return (
    <motion.button
      className={`relative font-medium inline-flex items-center justify-center shadow-lg transform transition-all ${getVariantClass()} ${getSizeClass()} ${isPressed ? 'translate-y-1 shadow-sm' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={!disabled ? onClick : undefined}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => isPressed && setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default ThreeDButton;