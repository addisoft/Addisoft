import React, { useState, useEffect, useRef } from 'react';
import { Question, Lifelines as LifelinesType, PRIZE_LADDER } from '../types';
import { generateImageHint } from '../services/geminiService';
import Lifelines from './Lifelines';
import { Image, Loader2 } from 'lucide-react';

interface GameScreenProps {
  questions: Question[];
  currentQuestionIndex: number;
  onAnswer: (isCorrect: boolean) => void;
  gameScore: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ questions, currentQuestionIndex, onAnswer, gameScore }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hintImage, setHintImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [lifelines, setLifelines] = useState<LifelinesType>({
    fiftyFifty: true,
    askAudience: true,
    callFriend: true
  });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isAnsweredRef = useRef(false);

  // Reset state on new question
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setHiddenOptions([]);
    isAnsweredRef.current = false;
    
    // Load image
    let isMounted = true;
    const fetchImage = async () => {
      setLoadingImage(true);
      setHintImage(null);
      const img = await generateImageHint(currentQuestion.visualHintPrompt);
      if (isMounted) {
        setHintImage(img);
        setLoadingImage(false);
      }
    };
    
    fetchImage();
    
    return () => { isMounted = false; };
  }, [currentQuestion]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || isAnsweredRef.current) return;
    
    setSelectedOption(index);
    isAnsweredRef.current = true;
    setShowAnswer(true);

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    
    // Delay to show result before moving on
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2500);
  };

  const handleUseLifeline = (type: keyof LifelinesType) => {
    if (!lifelines[type]) return;

    setLifelines(prev => ({ ...prev, [type]: false }));

    if (type === 'fiftyFifty') {
      const correct = currentQuestion.correctAnswerIndex;
      const wrongIndices = currentQuestion.options
        .map((_, i) => i)
        .filter(i => i !== correct);
      
      // Shuffle and take 2
      const toHide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
      setHiddenOptions(toHide);
    } else if (type === 'askAudience') {
       alert(`الجمهور يعتقد أن الإجابة الصحيحة هي رقم ${currentQuestion.correctAnswerIndex + 1}: ${currentQuestion.options[currentQuestion.correctAnswerIndex]}`);
    } else if (type === 'callFriend') {
       alert(`صديقك يقول: "أنا متأكد بنسبة 80% أن الإجابة هي ${currentQuestion.options[currentQuestion.correctAnswerIndex]}"`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-6 text-game-gold border-b border-gray-700 pb-4">
        <div className="text-xl font-bold">السؤال {currentQuestionIndex + 1} / {questions.length}</div>
        <div className="text-2xl font-bold text-white bg-game-purple px-4 py-1 rounded-lg">
          {gameScore > 0 ? gameScore.toLocaleString() : 0} <span className="text-sm">نقطة</span>
        </div>
      </div>

      {/* Image Hint Section */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 bg-game-blue rounded-2xl border-4 border-game-purple overflow-hidden flex items-center justify-center shadow-lg shadow-purple-900/50">
        {loadingImage ? (
          <div className="flex flex-col items-center text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-2" />
            <span className="animate-pulse text-sm">جاري رسم التلميح...</span>
          </div>
        ) : hintImage ? (
          <img 
            src={hintImage} 
            alt="Visual Hint" 
            className="w-full h-full object-cover transition-opacity duration-500 opacity-100" 
          />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Image className="w-16 h-16 mb-2 opacity-50" />
            <span className="text-xs">لا توجد صورة</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          {currentQuestion.category}
        </div>
      </div>

      {/* Question Text */}
      <div className="w-full bg-game-blue border-2 border-white/20 rounded-xl p-6 mb-8 text-center shadow-lg transform -skew-x-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed skew-x-2">
          {currentQuestion.questionText}
        </h2>
      </div>

      {/* Lifelines */}
      <Lifelines 
        lifelines={lifelines} 
        onUseLifeline={handleUseLifeline} 
        disabled={selectedOption !== null}
      />

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {currentQuestion.options.map((option, index) => {
          if (hiddenOptions.includes(index)) {
            return <div key={index} className="h-16 opacity-0"></div>;
          }

          let buttonStyle = "bg-game-blue border-gray-500 hover:bg-blue-800";
          
          if (showAnswer) {
            if (index === currentQuestion.correctAnswerIndex) {
              buttonStyle = "bg-game-correct border-green-400 animate-pulse text-black";
            } else if (index === selectedOption) {
              buttonStyle = "bg-game-wrong border-red-500 text-white";
            }
          } else if (selectedOption === index) {
            buttonStyle = "bg-orange-500 border-orange-300 text-white";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
              className={`
                relative h-16 rounded-full border-2 flex items-center px-6 transition-all duration-200
                text-lg md:text-xl font-semibold shadow-md
                ${buttonStyle}
              `}
            >
              <span className="text-game-gold font-bold ml-4 w-6">{['أ', 'ب', 'ج', 'د'][index]}:</span>
              <span className="flex-1 text-right">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameScreen;