import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameMode, AIDifficulty, PlayerColor } from '@/types/game';
import { Users, Bot, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const HomeScreen: React.FC = () => {
  const { initializeGame } = useGameStore();
  
  const [step, setStep] = useState<'mode' | 'players' | 'difficulty'>('mode');
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [playerCount, setPlayerCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setStep('players');
  };

  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count);
    if (gameMode === 'vsAI') {
      setStep('difficulty');
    } else {
      // Start game immediately for local multiplayer
      initializeGame(count, gameMode, aiDifficulty);
    }
  };

  const handleDifficultySelect = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
    initializeGame(playerCount, gameMode, difficulty);
  };

  const handleBack = () => {
    if (step === 'players') {
      setStep('mode');
    } else if (step === 'difficulty') {
      setStep('players');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        {/* Dice logo */}
        <motion.div
          animate={{ rotateZ: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-xl flex items-center justify-center"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          }}
        >
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2.5 h-2.5 rounded-full bg-gray-800',
                  i === 4 && 'col-start-2'
                )}
              />
            ))}
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold text-foreground mb-2">LUDO</h1>
        <p className="text-muted-foreground">Classic Board Game</p>
      </motion.div>

      {/* Content based on step */}
      <div className="w-full max-w-sm">
        {step === 'mode' && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Choose Game Mode
            </h2>

            <MenuButton
              icon={<Users className="w-6 h-6" />}
              title="Play with Friends"
              subtitle="Local multiplayer on same device"
              onClick={() => handleModeSelect('local')}
              color="blue"
            />

            <MenuButton
              icon={<Bot className="w-6 h-6" />}
              title="Play vs AI"
              subtitle="Challenge the computer"
              onClick={() => handleModeSelect('vsAI')}
              color="purple"
            />
          </motion.div>
        )}

        {step === 'players' && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-4"
          >
            <button
              onClick={handleBack}
              className="text-muted-foreground text-sm mb-4 flex items-center gap-1 hover:text-foreground transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Number of Players
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((count) => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayerCountSelect(count)}
                  className="glass p-6 text-center hover:border-primary/50 transition-all"
                >
                  <span className="text-3xl font-bold text-foreground">{count}</span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    Player{count > 1 ? 's' : ''}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Player colors preview */}
            <div className="mt-6 p-4 glass-sm">
              <p className="text-sm text-muted-foreground mb-3">Players:</p>
              <div className="flex justify-center gap-4">
                {getPlayerColorPreview(playerCount).map((color) => (
                  <div
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full',
                      color === 'red' && 'bg-red-500',
                      color === 'green' && 'bg-green-500',
                      color === 'yellow' && 'bg-yellow-500',
                      color === 'blue' && 'bg-blue-500'
                    )}
                    style={{
                      boxShadow: `0 0 15px ${
                        color === 'red'
                          ? 'rgba(239, 68, 68, 0.5)'
                          : color === 'green'
                          ? 'rgba(34, 197, 94, 0.5)'
                          : color === 'yellow'
                          ? 'rgba(234, 179, 8, 0.5)'
                          : 'rgba(59, 130, 246, 0.5)'
                      }`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'difficulty' && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-4"
          >
            <button
              onClick={handleBack}
              className="text-muted-foreground text-sm mb-4 flex items-center gap-1 hover:text-foreground transition-colors"
            >
              ← Back
            </button>

            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              AI Difficulty
            </h2>

            <MenuButton
              title="Easy"
              subtitle="Relaxed gameplay, AI makes some mistakes"
              onClick={() => handleDifficultySelect('easy')}
              color="green"
            />

            <MenuButton
              title="Medium"
              subtitle="Balanced challenge, smart decisions"
              onClick={() => handleDifficultySelect('medium')}
              color="yellow"
            />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-xs text-muted-foreground">
          Made with ❤️ using React
        </p>
      </motion.div>
    </motion.div>
  );
};

// Menu button component
interface MenuButtonProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  color,
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-xl border bg-gradient-to-br flex items-center gap-4 text-left transition-all',
        colorClasses[color]
      )}
    >
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center text-foreground">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.button>
  );
};

// Helper to get player colors based on count
function getPlayerColorPreview(count: number): PlayerColor[] {
  if (count === 2) return ['red', 'yellow'];
  if (count === 3) return ['red', 'green', 'yellow'];
  return ['red', 'green', 'yellow', 'blue'];
}

export default HomeScreen;
