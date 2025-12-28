
import React, { useEffect, useState } from 'react';

interface ExamHeaderProps {
  timeLeft: number;
  onTimeUp: () => void;
  title: string;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({ timeLeft, onTimeUp, title }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center px-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500 w-10 h-10 rounded flex items-center justify-center font-bold text-slate-900">CBT</div>
        <h1 className="text-lg md:text-xl font-bold">{title}</h1>
      </div>
      <div className={`flex items-center gap-2 px-4 py-1 rounded-full border ${timeLeft < 300 ? 'border-red-500 bg-red-500/10' : 'border-emerald-500 bg-emerald-500/10'}`}>
        <span className="text-sm font-medium">남은 시간:</span>
        <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-emerald-400'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </header>
  );
};
