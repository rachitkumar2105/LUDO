import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export const SplashScreen: React.FC = () => {
  const { setScreen } = useGameStore();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    // Show title after a brief delay
    const titleTimer = setTimeout(() => setShowTitle(true), 300);
    
    // Transition to home after 2.5 seconds
    const transitionTimer = setTimeout(() => {
      setScreen('home');
    }, 2500);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(transitionTimer);
    };
  }, [setScreen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-purple-900/20" />

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              background: `radial-gradient(circle, ${
                ['rgba(239, 68, 68, 0.1)', 'rgba(34, 197, 94, 0.1)', 'rgba(234, 179, 8, 0.1)', 'rgba(59, 130, 246, 0.1)'][i]
              } 0%, transparent 70%)`,
              left: `${20 + i * 15}%`,
              top: `${20 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Logo/Title */}
      {showTitle && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 text-center"
        >
          {/* Dice icon */}
          <motion.div
            animate={{ 
              rotateZ: [0, 10, -10, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-2xl flex items-center justify-center"
            style={{
              boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)',
            }}
          >
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-16 h-16">
              {[0, 2, 4, 6, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-3 h-3 rounded-full bg-gray-800"
                  style={{
                    gridColumn: (i % 3) + 1,
                    gridRow: Math.floor(i / 3) + 1,
                    visibility: [0, 2, 4, 6, 8].includes(i) ? 'visible' : 'hidden',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-foreground mb-2"
            style={{
              textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
            }}
          >
            LUDO
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg"
          >
            Classic Board Game
          </motion.p>
        </motion.div>
      )}

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
