export enum GameState {
  LOBBY = 'LOBBY',
  PRE_ROUND = 'PRE_ROUND',
  PLAYING = 'PLAYING',
  ROUND_RESULT = 'ROUND_RESULT',
  GAME_OVER = 'GAME_OVER'
}

export enum Difficulty {
  NOVICE = 'Novice',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert'
}

export interface Challenge {
  id: string;
  topic: string;
  question: string;
  codeSnippet: string; // C code context
  correctAnswer: string;
  options?: string[]; // If multiple choice
  explanation: string;
  type: 'SHORT_ANSWER' | 'MULTIPLE_CHOICE';
}

export interface Player {
  name: string;
  score: number;
  health: number;
  avatar: string;
  isAi: boolean;
}

export type BattleLog = {
  message: string;
  type: 'info' | 'success' | 'damage' | 'ai';
  timestamp: number;
};
