import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { GameOverScreen } from '@/components/screens/GameOverScreen';

const Index: React.FC = () => {
  const { currentScreen } = useGameStore();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && <SplashScreen key="splash" />}
        {currentScreen === 'home' && <HomeScreen key="home" />}
        {currentScreen === 'game' && <GameScreen key="game" />}
        {currentScreen === 'gameOver' && <GameOverScreen key="gameOver" />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
