import { useEffect, useState, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const BackgroundEffect = ({ darkMode }) => {
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const particleControls = useAnimationControls();
  
  useEffect(() => {
    // Generate more complex and diverse particles
    const generateParticles = () => {
      const newParticles = [];
      const count = window.innerWidth < 768 ? 20 : 35;
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 15 + 5;
        const opacity = Math.random() * 0.3 + 0.05;
        
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
          opacity,
          shape: Math.random() > 0.4 
            ? 'circle' 
            : Math.random() > 0.5 
              ? 'square' 
              : 'triangle',
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2
        });
      }
      
      setParticles(newParticles);
    };
    
    // Handle mouse movement to create interactive effects
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
    };
    
    generateParticles();
    document.addEventListener('mousemove', handleMouseMove);
    
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);

    // Create subtle animation for background
    const interval = setInterval(() => {
      particleControls.start({
        opacity: [0.7, 0.8, 0.7],
        transition: { duration: 3, ease: "easeInOut" }
      });
    }, 3000);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);
  
  // Enhanced particle rendering with more shapes and effects
  const renderParticle = (particle) => {
    if (particle.shape === 'circle') {
      return (
        <g>
          <circle 
            r={particle.size}
            cx="50%"
            cy="50%"
            fill={darkMode ? `rgba(255, 255, 255, ${particle.opacity})` : `rgba(99, 102, 241, ${particle.opacity})`}
          />
          <circle 
            r={particle.size * 0.6}
            cx="50%"
            cy="50%"
            fill="none"
            stroke={darkMode ? `rgba(255, 255, 255, ${particle.opacity * 1.5})` : `rgba(79, 70, 229, ${particle.opacity * 1.5})`}
            strokeWidth="1"
          />
        </g>
      );
    } else if (particle.shape === 'square') {
      return (
        <g>
          <rect 
            width={particle.size * 2}
            height={particle.size * 2}
            x={`calc(50% - ${particle.size}px)`}
            y={`calc(50% - ${particle.size}px)`}
            fill={darkMode ? `rgba(255, 255, 255, ${particle.opacity})` : `rgba(20, 184, 166, ${particle.opacity})`}
            transform={`rotate(${particle.rotation} 50% 50%)`}
          />
          <rect 
            width={particle.size}
            height={particle.size}
            x={`calc(50% - ${particle.size * 0.5}px)`}
            y={`calc(50% - ${particle.size * 0.5}px)`}
            fill="none"
            stroke={darkMode ? `rgba(255, 255, 255, ${particle.opacity * 1.5})` : `rgba(14, 159, 110, ${particle.opacity * 1.5})`}
            strokeWidth="1"
            transform={`rotate(${particle.rotation} 50% 50%)`}
          />
        </g>
      );
    } else { // triangle
      const size = particle.size * 1.5;
      // Create points for an equilateral triangle
      const points = `${50}%,${50 - size} ${50 - size * 0.866}%,${50 + size * 0.5} ${50 + size * 0.866}%,${50 + size * 0.5}`;
      
      return (
        <g transform={`rotate(${particle.rotation} 50% 50%)`}>
          <polygon 
            points={points}
            fill={darkMode ? `rgba(255, 255, 255, ${particle.opacity})` : `rgba(245, 158, 11, ${particle.opacity})`}
          />
          <polygon 
            points={`${50}%,${50 - size * 0.7} ${50 - size * 0.866 * 0.7}%,${50 + size * 0.5 * 0.7} ${50 + size * 0.866 * 0.7}%,${50 + size * 0.5 * 0.7}`}
            fill="none"
            stroke={darkMode ? `rgba(255, 255, 255, ${particle.opacity * 1.5})` : `rgba(217, 119, 6, ${particle.opacity * 1.5})`}
            strokeWidth="1"
          />
        </g>
      );
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 z-0 overflow-hidden ${darkMode ? 'bg-mesh-dark' : 'bg-mesh-light'}`}
    >
      <motion.div 
        className={`absolute inset-0 ${darkMode ? 'bg-gradient-dark' : 'bg-gradient-light'} opacity-70`}
        animate={particleControls}
      ></motion.div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-noise-pattern opacity-[0.03] mix-blend-overlay"></div>
      
      {/* SVG particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {particles.map(particle => (
          <motion.g
            key={particle.id}
            initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0, rotate: particle.rotation }}
            animate={{ 
              x: [
                `${particle.x}%`, 
                `${(particle.x + (mousePosition.x > particle.x ? 8 : -8)) % 100}%`
              ], 
                `${particle.y}%`, 
                `${(particle.y + (mousePosition.y > particle.y ? 12 : -12)) % 100}%`
                `${(particle.y + (mousePosition && 
                  mousePosition.y > particle.y ? 12 : -12)) % 100}%`
              opacity: particle.opacity,
              rotate: particle.rotation + particle.rotationSpeed * 360
            }}
            transition={{ 
              duration: particle.duration, 
              delay: particle.delay, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
          >
            {renderParticle(particle)}
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default BackgroundEffect;