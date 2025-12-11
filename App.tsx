import React, { useState } from 'react';
import { GameLobby } from './components/GameLobby';
import { BattleArena } from './components/BattleArena';
import { Difficulty, GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [gameConfig, setGameConfig] = useState<{difficulty: Difficulty, topic: string} | null>(null);

  const startGame = (difficulty: Difficulty, topic: string) => {
    setGameConfig({ difficulty, topic });
    setGameState(GameState.PLAYING);
  };

  const exitGame = () => {
    setGameState(GameState.LOBBY);
    setGameConfig(null);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white selection:bg-cyber-neon selection:text-black">
      {gameState === GameState.LOBBY && <GameLobby onStart={startGame} />}
      {gameState === GameState.PLAYING && gameConfig && (
        <BattleArena 
          difficulty={gameConfig.difficulty} 
          topic={gameConfig.topic} 
          onExit={exitGame} 
        />
      )}
    </div>
  );
}

export default App;
