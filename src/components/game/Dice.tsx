import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  disabled?: boolean;
  playerColor?: string;
}

const dotPositions: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 50, y: 50 }],
  2: [
    { x: 25, y: 25 },
    { x: 75, y: 75 },
  ],
  3: [
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 75, y: 75 },
  ],
  4: [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 25, y: 75 },
    { x: 75, y: 75 },
  ],
  5: [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 50, y: 50 },
    { x: 25, y: 75 },
    { x: 75, y: 75 },
  ],
  6: [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 25, y: 50 },
    { x: 75, y: 50 },
    { x: 25, y: 75 },
    { x: 75, y: 75 },
  ],
};

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  disabled = false,
  playerColor = 'primary',
}) => {
  const dots = dotPositions[value] || [];

  return (
    <motion.button
      onClick={onRoll}
      disabled={disabled || !canRoll || isRolling}
      className={cn(
        'relative w-20 h-20 rounded-2xl cursor-pointer transition-all duration-200',
        'bg-gradient-to-br from-white to-gray-100',
        'shadow-lg hover:shadow-xl border border-gray-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isRolling && 'dice-rolling',
        canRoll && !disabled && 'hover:scale-105 active:scale-95'
      )}
      style={{
        boxShadow: canRoll && !disabled
          ? '0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(255, 215, 0, 0.5)'
          : '0 4px 10px rgba(0,0,0,0.2)',
      }}
      whileTap={canRoll && !disabled ? { scale: 0.95 } : {}}
      animate={isRolling ? {
        rotateX: [0, 360, 720],
        rotateY: [0, 180, 360],
        rotateZ: [0, 90, 180],
      } : {}}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Dice face */}
      <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-gray-100">
        {/* 3D edge effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent" />

        {/* Dots */}
        <AnimatePresence mode="wait">
          {!isRolling && value > 0 && (
            <motion.div
              key={value}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {dots.map((dot, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="absolute w-3 h-3 rounded-full bg-black"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rolling indicator */}
        {isRolling && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"
          />
        )}

        {/* Tap to roll hint */}
        {canRoll && !isRolling && value === 0 && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs font-bold text-gray-400"
          >
            ROLL
          </motion.span>
        )}
      </div>

      {/* Glow effect when can roll */}
      {canRoll && !disabled && (
        <motion.div
          className="absolute -inset-2 rounded-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default Dice;
