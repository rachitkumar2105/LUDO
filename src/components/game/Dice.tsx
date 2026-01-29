import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiceProps {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

const dotPositions: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
};

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  onRoll,
  disabled = false,
}) => {
  const dots = dotPositions[value] || [];

  return (
    <div className="flex flex-col items-center">
      {/* Dice visual container */}
      <div className="relative p-2 rounded-xl bg-blue-900/30 backdrop-blur-sm border border-blue-400/30 shadow-xl">
        <motion.button
          onClick={onRoll}
          disabled={disabled || !canRoll || isRolling}
          className={cn(
            'relative w-16 h-16 rounded-xl cursor-pointer transition-all duration-200',
            'bg-white border-2 border-gray-200',
            'shadow-[0_4px_0_0_rgb(203,213,225)]', // 3D blocky shadow button feel
            isRolling && 'dice-rolling',
            canRoll && !disabled && 'active:translate-y-1 active:shadow-none hover:bg-gray-50'
          )}
          whileTap={canRoll && !disabled ? { scale: 0.95 } : {}}
          animate={isRolling ? {
            rotateX: [0, 360, 720],
            rotateY: [0, 180, 360],
            rotateZ: [0, 90, 180],
          } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Inner Face */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-white to-gray-100">
            {/* Dots */}
            <AnimatePresence mode="wait">
              {!isRolling && value > 0 && (
                <motion.div
                  key={value}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {dots.map((dot, index) => (
                    <div
                      key={index}
                      className="absolute w-2.5 h-2.5 rounded-full bg-black shadow-inner"
                      style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question mark or Prompt when 0/Waiting */}
            {value === 0 && !isRolling && (
              <div className="text-gray-300 font-bold text-2xl">?</div>
            )}

            {/* Rolling fake blur */}
            {isRolling && (
              <div className="absolute inset-0 bg-white/50 blur-sm flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-t-black border-r-transparent border-b-black border-l-transparent animate-spin" />
              </div>
            )}
          </div>
        </motion.button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 h-6">
        {canRoll && !isRolling && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white text-xs font-bold px-3 py-1 bg-blue-600 rounded-full shadow-lg border border-blue-400"
          >
            YOUR TURN
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dice;
