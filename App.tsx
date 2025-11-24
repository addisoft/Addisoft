import React, { useState, useEffect } from 'react';
import { GameState, Question, PRIZE_LADDER } from './types';
import { generateQuizQuestions } from './services/geminiService';
import GameScreen from './components/GameScreen';
import { Trophy, Loader2, PlayCircle, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startGame = async () => {
    setGameState(GameState.LOADING_QUESTIONS);
    setError(null);
    try {
      const q = await generateQuizQuestions();
      if (q.length === 0) throw new Error("لم يتم العثور على أسئلة");
      setQuestions(q);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameState(GameState.PLAYING);
    } catch (e) {
      console.error(e);
      setError("حدث خطأ أثناء تحميل الأسئلة. يرجى المحاولة مرة أخرى.");
      setGameState(GameState.WELCOME);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const newScore = PRIZE_LADDER[currentQuestionIndex];
      setScore(newScore);
      
      if (currentQuestionIndex + 1 >= questions.length) {
        setGameState(GameState.VICTORY);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } else {
      setGameState(GameState.GAME_OVER);
    }
  };

  const restartGame = () => {
    setGameState(GameState.WELCOME);
    setQuestions([]);
    setScore(0);
  };

  // Welcome Screen
  if (gameState === GameState.WELCOME) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1541339907198-e021fc0126c0?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-game-dark/80 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 text-center max-w-2xl bg-game-blue/90 p-8 rounded-3xl border-4 border-game-gold shadow-2xl">
          <Trophy className="w-24 h-24 text-game-gold mx-auto mb-6 animate-bounce-slow" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-sans text-shadow-lg">
            العباقرة الصغار
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            اختبر معلوماتك في الخضر، الفواكه، المهن، والمدرسة.
            <br/>
            أجب على الأسئلة واكشف الصور لتفوز بالمليون!
          </p>
          
          {error && <div className="text-red-400 mb-4 bg-red-900/50 p-2 rounded">{error}</div>}

          <button
            onClick={startGame}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-purple-500/50"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <PlayCircle className="ml-2 w-8 h-8" />
            <span>ابدأ التحدي</span>
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (gameState === GameState.LOADING_QUESTIONS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-dark text-white">
        <Loader2 className="w-16 h-16 text-game-gold animate-spin mb-4" />
        <h2 className="text-2xl font-bold animate-pulse">جاري تحضير الأسئلة الذكية...</h2>
        <p className="text-gray-400 mt-2">الذكاء الاصطناعي يكتب لك تحدياً جديداً</p>
      </div>
    );
  }

  // Result Screens (Win/Loss)
  if (gameState === GameState.VICTORY || gameState === GameState.GAME_OVER) {
    const isVictory = gameState === GameState.VICTORY;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-game-dark">
        <div className={`max-w-xl w-full p-8 rounded-3xl border-4 text-center shadow-2xl ${isVictory ? 'bg-gradient-to-b from-green-900 to-game-dark border-game-correct' : 'bg-gradient-to-b from-red-900 to-game-dark border-game-wrong'}`}>
          {isVictory ? (
            <Trophy className="w-32 h-32 text-game-gold mx-auto mb-6 animate-bounce" />
          ) : (
            <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-red-500/20 rounded-full">
               <span className="text-6xl">😢</span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {isVictory ? "مبروك! أنت عبقري!" : "حظ أوفر المرة القادمة"}
          </h1>
          
          <div className="my-8 p-4 bg-black/30 rounded-xl">
            <p className="text-gray-300 text-lg mb-2">رصيدك النهائي</p>
            <p className="text-4xl font-bold text-game-gold font-mono">{score.toLocaleString()}</p>
          </div>

          <button
            onClick={restartGame}
            className="inline-flex items-center px-6 py-3 text-xl font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
          >
            <RotateCcw className="ml-2" />
            العب مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div className="min-h-screen bg-game-dark text-white font-sans py-8">
       <GameScreen
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          onAnswer={handleAnswer}
          gameScore={score}
       />
    </div>
  );
};

export default App;