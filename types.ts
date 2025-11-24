export enum GameState {
  WELCOME = 'WELCOME',
  LOADING_QUESTIONS = 'LOADING_QUESTIONS',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  visualHintPrompt: string; // Prompt to generate the image
  category: string;
}

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  callFriend: boolean;
}

export const PRIZE_LADDER = [
  100, 200, 300, 500, 1000, 
  2000, 4000, 8000, 16000, 32000, 
  64000, 125000, 250000, 500000, 1000000
];