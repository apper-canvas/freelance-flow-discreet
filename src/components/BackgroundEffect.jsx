import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundEffect = ({ darkMode }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate random particles
    const generateParticles = () => {
      const newParticles = [];
      const count = window.innerWidth < 768 ? 15 : 25;
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 5,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.5 + 0.1,
          shape: Math.random() > 0.5 ? 'circle' : 'square'
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    const handleResize = () => {
      generateParticles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const renderParticle = (particle) => {
    if (particle.shape === 'circle') {
      return (
        <circle 
          r={particle.size}
          cx="50%"
          cy="50%"
          fill={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)"}
        />
      );
    } else {
      return (
        <rect 
          width={particle.size * 2}
          height={particle.size * 2}
          x={`calc(50% - ${particle.size}px)`}
          y={`calc(50% - ${particle.size}px)`}
          fill={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(20, 184, 166, 0.1)"}
        />
      );
    }
  };
  
  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${darkMode ? 'bg-gradient-dark' : 'bg-gradient-light'}`}>
      <div className="absolute inset-0 bg-animated-gradient"></div>
      <svg className="absolute inset-0 w-full h-full">
        {particles.map(particle => (
          <motion.g
            key={particle.id}
            initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0 }}
            animate={{ x: [`${particle.x}%`, `${(particle.x + 10) % 100}%`], y: [`${particle.y}%`, `${(particle.y + 15) % 100}%`], opacity: particle.opacity }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            {renderParticle(particle)}
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default BackgroundEffect;