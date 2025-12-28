
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  isReview?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedAnswer, 
  onSelectAnswer,
  isReview = false 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">문제 {question.id}</span>
        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">{question.subject}</span>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 leading-relaxed">
          {question.questionText}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = isReview && question.correctAnswer === idx;
            const isWrong = isReview && isSelected && !isCorrect;

            let borderColor = 'border-slate-200';
            let bgColor = 'bg-white';
            let textColor = 'text-slate-700';

            if (isSelected && !isReview) {
              borderColor = 'border-amber-500';
              bgColor = 'bg-amber-50';
              textColor = 'text-amber-900';
            }

            if (isReview) {
              if (isCorrect) {
                borderColor = 'border-emerald-500';
                bgColor = 'bg-emerald-50';
                textColor = 'text-emerald-900';
              } else if (isWrong) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
                textColor = 'text-red-900';
              }
            }

            return (
              <button
                key={idx}
                disabled={isReview}
                onClick={() => onSelectAnswer(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-4 ${borderColor} ${bgColor} ${textColor} ${!isReview ? 'hover:border-amber-300 hover:bg-slate-50 active:scale-[0.99]' : ''}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 
                  ${isSelected && !isReview ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}
                  ${isReview && isCorrect ? 'bg-emerald-500 text-white' : ''}
                  ${isReview && isWrong ? 'bg-red-500 text-white' : ''}
                `}>
                  {idx + 1}
                </span>
                <span className="text-md leading-snug">{option}</span>
              </button>
            );
          })}
        </div>

        {isReview && (
          <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
              해설
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
