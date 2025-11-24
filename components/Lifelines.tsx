import React from 'react';
import { Users, Phone, Divide } from 'lucide-react';
import { Lifelines as LifelinesType } from '../types';

interface LifelinesProps {
  lifelines: LifelinesType;
  onUseLifeline: (type: keyof LifelinesType) => void;
  disabled: boolean;
}

const Lifelines: React.FC<LifelinesProps> = ({ lifelines, onUseLifeline, disabled }) => {
  return (
    <div className="flex gap-4 justify-center mb-6">
      <button
        onClick={() => onUseLifeline('fiftyFifty')}
        disabled={!lifelines.fiftyFifty || disabled}
        className={`relative group flex items-center justify-center w-16 h-12 rounded-full border-2 
          ${!lifelines.fiftyFifty 
            ? 'border-gray-600 bg-gray-800 text-gray-600 cursor-not-allowed' 
            : 'border-game-gold bg-blue-900 hover:bg-blue-800 text-game-gold'}`}
        title="حذف إجابتين (50:50)"
      >
        <span className="font-bold text-lg">50:50</span>
        {!lifelines.fiftyFifty && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-2xl transform rotate-45">+</div>}
      </button>

      <button
        onClick={() => onUseLifeline('askAudience')}
        disabled={!lifelines.askAudience || disabled}
        className={`relative group flex items-center justify-center w-16 h-12 rounded-full border-2 
          ${!lifelines.askAudience
            ? 'border-gray-600 bg-gray-800 text-gray-600 cursor-not-allowed' 
            : 'border-game-gold bg-blue-900 hover:bg-blue-800 text-game-gold'}`}
        title="سؤال الجمهور"
      >
        <Users size={24} />
      </button>

      <button
        onClick={() => onUseLifeline('callFriend')}
        disabled={!lifelines.callFriend || disabled}
        className={`relative group flex items-center justify-center w-16 h-12 rounded-full border-2 
          ${!lifelines.callFriend
            ? 'border-gray-600 bg-gray-800 text-gray-600 cursor-not-allowed' 
            : 'border-game-gold bg-blue-900 hover:bg-blue-800 text-game-gold'}`}
        title="اتصال بصديق"
      >
        <Phone size={24} />
      </button>
    </div>
  );
};

export default Lifelines;