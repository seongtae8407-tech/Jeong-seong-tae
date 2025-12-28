
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ExamSession, Question, Subject } from './types';
import { generateMockExam } from './services/geminiService';
import { ExamHeader } from './components/ExamHeader';
import { QuestionCard } from './components/QuestionCard';

const EXAM_TIME_SECONDS = 40 * 60; // 40 minutes for 20 questions mockup

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Home);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (appState === AppState.Exam && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && appState === AppState.Exam) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [appState, timeLeft]);

  const startExam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const questions = await generateMockExam(20);
      setSession({
        questions,
        userAnswers: new Array(questions.length).fill(null),
        startTime: Date.now(),
        endTime: null,
        score: 0
      });
      setCurrentIndex(0);
      setTimeLeft(EXAM_TIME_SECONDS);
      setAppState(AppState.Exam);
    } catch (err: any) {
      setError(err.message || "문제를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (ansIdx: number) => {
    if (!session) return;
    const newAnswers = [...session.userAnswers];
    newAnswers[currentIndex] = ansIdx;
    setSession({ ...session, userAnswers: newAnswers });
  };

  const handleComplete = () => {
    if (!session) return;
    
    let correctCount = 0;
    session.questions.forEach((q, idx) => {
      if (session.userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / session.questions.length) * 100);
    setSession({ ...session, score: finalScore, endTime: Date.now() });
    setAppState(AppState.Result);
  };

  const goToReview = () => setAppState(AppState.Review);
  const goToHome = () => {
    setAppState(AppState.Home);
    setSession(null);
    setCurrentIndex(0);
  };

  if (appState === AppState.Home) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v4M7 7h10"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">K-HazardMaster CBT</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            위험물산업기사 국가기술자격시험 합격을 위한 스마트 모의고사 시스템입니다.<br/>
            실제 시험과 동일한 배분으로 인공지능이 생성한 최신 문제를 풀어보세요.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-sm text-slate-500 mb-1">문항 수</span>
              <span className="block text-lg font-bold text-slate-800">20문제</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-sm text-slate-500 mb-1">제한 시간</span>
              <span className="block text-lg font-bold text-slate-800">40분</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-sm text-slate-500 mb-1">대상 과목</span>
              <span className="block text-lg font-bold text-slate-800">전 과목</span>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                인공지능이 문제를 구성하고 있습니다...
              </span>
            ) : "모의고사 시작하기"}
          </button>
          
          {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  if (appState === AppState.Exam && session) {
    const currentQuestion = session.questions[currentIndex];
    const isLast = currentIndex === session.questions.length - 1;

    return (
      <div className="min-h-screen bg-slate-50">
        <ExamHeader 
          title="위험물산업기사 실전 모의고사" 
          timeLeft={timeLeft} 
          onTimeUp={handleComplete} 
        />
        
        <main className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center text-sm font-semibold text-slate-500">
              <span>전체 {session.questions.length}개 중 {currentIndex + 1}번째 문제</span>
              <div className="flex gap-1">
                {session.questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-amber-500' : session.userAnswers[i] !== null ? 'bg-slate-800' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            
            <QuestionCard 
              question={currentQuestion} 
              selectedAnswer={session.userAnswers[currentIndex]} 
              onSelectAnswer={handleSelectAnswer}
            />

            <div className="flex justify-between items-center mt-6">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-6 py-3 rounded-lg border border-slate-300 font-bold text-slate-600 hover:bg-white disabled:opacity-30"
              >
                이전 문제
              </button>
              
              {!isLast ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-8 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
                >
                  다음 문제
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-colors"
                >
                  최종 제출하기
                </button>
              )}
            </div>
          </div>

          <aside className="w-full md:w-64 bg-white rounded-xl border border-slate-200 p-4 sticky top-24 h-fit">
            <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b">답안 상황판</h3>
            <div className="grid grid-cols-5 gap-2">
              {session.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-bold border transition-all
                    ${i === currentIndex ? 'border-amber-500 bg-amber-500 text-white ring-2 ring-amber-200' : 
                      session.userAnswers[i] !== null ? 'border-slate-800 bg-slate-800 text-white' : 
                      'border-slate-200 text-slate-400 hover:border-slate-300'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>푼 문제</span>
                <span className="font-bold text-slate-900">{session.userAnswers.filter(a => a !== null).length} / {session.questions.length}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div 
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(session.userAnswers.filter(a => a !== null).length / session.questions.length) * 100}%` }}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    );
  }

  if (appState === AppState.Result && session) {
    const isPass = session.score >= 60;
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className={`${isPass ? 'bg-emerald-600' : 'bg-red-600'} p-8 text-center text-white`}>
            <div className="text-sm font-bold opacity-80 mb-2 uppercase tracking-widest">EXAM RESULT</div>
            <h2 className="text-5xl font-black mb-4">{session.score}점</h2>
            <div className="inline-block px-4 py-1 rounded-full bg-white/20 font-bold text-lg">
              {isPass ? '최종 합격권입니다!' : '불합격 (보충 학습이 필요합니다)'}
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">총 문제 수</span>
                <span className="font-bold text-slate-900">{session.questions.length}문항</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">맞은 개수</span>
                <span className="font-bold text-emerald-600">{session.userAnswers.filter((a, i) => a === session.questions[i].correctAnswer).length}문항</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">소요 시간</span>
                <span className="font-bold text-slate-900">{Math.floor((session.endTime! - session.startTime) / 60000)}분</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={goToReview}
                className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
              >
                오답 노트 및 전체 해설 보기
              </button>
              <button
                onClick={goToHome}
                className="w-full py-4 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === AppState.Review && session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 p-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setAppState(AppState.Result)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-900">상세 리뷰 및 해설</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">점수: {session.score}점</span>
            <button onClick={goToHome} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 text-sm">홈으로</button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
              학습 팁
            </h3>
            <p className="text-sm">정답은 <span className="text-emerald-600 font-bold">초록색</span>으로, 본인이 선택한 오답은 <span className="text-red-500 font-bold">빨간색</span>으로 표시됩니다. 하단의 해설을 꼼꼼히 읽어보세요.</p>
          </div>

          <div className="space-y-6">
            {session.questions.map((q, idx) => (
              <QuestionCard 
                key={idx}
                question={q}
                selectedAnswer={session.userAnswers[idx]}
                onSelectAnswer={() => {}}
                isReview={true}
              />
            ))}
          </div>

          <button
            onClick={goToHome}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl transition-all active:scale-[0.99]"
          >
            복습 완료 및 처음으로
          </button>
        </main>
      </div>
    );
  }

  return null;
};

export default App;
