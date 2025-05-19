import { motion } from 'framer-motion';

const AnimatedIcon = ({ 
  icon: Icon, 
  size = 24, 
  color = 'currentColor',
  hoverEffect = 'bounce', // 'bounce', 'pulse', 'spin', 'shake'
  onClick,
  className = '',
  ...props 
}) => {
  // Define different hover animations
  const getHoverAnimation = () => {
    switch(hoverEffect) {
      case 'bounce':
        return { y: [0, -5, 0] };
      case 'pulse':
        return { scale: [1, 1.1, 1] };
      case 'spin':
        return { rotate: 360 };
      case 'shake':
        return { x: [0, -3, 3, -3, 3, 0] };
      default:
        return { scale: 1.1 };
    }
  };

  // Get transitions based on effect type
  const getTransition = () => {
    switch(hoverEffect) {
      case 'spin':
        return { duration: 0.7, ease: 'easeInOut' };
      case 'shake':
        return { duration: 0.4, ease: 'easeInOut' };
      default:
        return { duration: 0.4, ease: [0.25, 1, 0.5, 1] };
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      whileHover={getHoverAnimation()}
      transition={getTransition()}
      onClick={onClick}
      {...props}
    >
      <Icon size={size} color={color} />
    </motion.div>
  );
};

export default AnimatedIcon;