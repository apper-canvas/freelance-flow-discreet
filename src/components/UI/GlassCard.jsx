import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  interactive = false, 
  glareOnHover = false,
  onClick, 
  ...props 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const xVal = (e.clientX - rect.left) / rect.width;
    const yVal = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x: xVal, y: yVal });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card ${className}`}
      whileHover={interactive ? { 
        scale: 1.02, 
        boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)",
        rotateX: mousePosition.y * 10 - 5,
        rotateY: mousePosition.x * 10 - 5,
      } : {}}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      {...props}
    >
      {children}
      {glareOnHover && interactive && <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-50 bg-gradient-to-tr from-transparent via-white to-transparent transition-opacity duration-300" style={{ mixBlendMode: 'overlay', transform: `rotate(${mousePosition.x * 180}deg)` }} />}
    </motion.div>
  );
};

export default GlassCard;