import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SosPanicButton from './components/SosPanicButton';
import ContractDashboard from './components/ContractDashboard';
import BiologicalTracker from './components/BiologicalTracker';
import QuizModal from './components/QuizModal';
import VocabModal from './components/VocabModal';

import questionsData from './data/questions.json';
import { getInitialState, saveState } from './utils/storage';
import { FastForward, RotateCcw } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [activeQuizMode, setActiveQuizMode] = useState(null); // 'sos' | 'practice' | null
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState([]);
  const [showVocabModal, setShowVocabModal] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const isTodayDone = !!state.completedDays[state.currentDay - 1];

  // Start a quiz session
  const handleStartQuiz = (mode) => {
    // Pick random questions from the pool (3 for emergency SOS, 5 for practice)
    const count = mode === 'practice' ? 5 : 3;
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    setCurrentQuizQuestions(selected);
    setActiveQuizMode(mode);
  };

  // Complete a quiz session
  const handleCompleteSession = () => {
    setState((prev) => {
      const dayIdx = prev.currentDay - 1;
      const newCompletedDays = [...prev.completedDays];
      let newStreak = prev.streak;

      if (!newCompletedDays[dayIdx]) {
        newCompletedDays[dayIdx] = true;
        newStreak += 1;
      }

      return {
        ...prev,
        completedDays: newCompletedDays,
        totalCravingsIntercepted: prev.totalCravingsIntercepted + 1,
        streak: newStreak
      };
    });
  };

  // Save vocab item
  const handleSaveVocab = (question) => {
    setState((prev) => {
      const exists = prev.savedVocab.some((v) => v.id === question.id);
      if (exists) return prev;
      return {
        ...prev,
        savedVocab: [
          ...prev.savedVocab,
          {
            id: question.id,
            blank: question.blank,
            punchline: question.punchline,
            vocab: question.vocab
          }
        ]
      };
    });
  };

  // Remove vocab item
  const handleRemoveVocab = (id) => {
    setState((prev) => ({
      ...prev,
      savedVocab: prev.savedVocab.filter((v) => v.id !== id)
    }));
  };

  // Demo tool: fast forward to next day
  const handleNextDay = () => {
    setState((prev) => ({
      ...prev,
      currentDay: Math.min(14, prev.currentDay + 1)
    }));
  };

  // Demo tool: reset state
  const handleReset = () => {
    localStorage.removeItem('mind_over_smoke_state_v1');
    setState(getInitialState());
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans">
      <Header 
        state={state} 
        onOpenVocab={() => setShowVocabModal(true)} 
        onResetDemo={handleReset}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 pb-12">
        {/* Core Hero: Emergency SOS Crave Interceptor */}
        <SosPanicButton 
          onStartQuiz={handleStartQuiz} 
          isTodayDone={isTodayDone}
          streak={state.streak}
        />

        {/* 14-Day Commitment Contract & Rebate Matrix */}
        <ContractDashboard 
          state={state} 
        />

        {/* Biological and Financial ROI Health Tracker */}
        <BiologicalTracker 
          state={state} 
        />

        {/* Developer / Demo Quick-test toolbar */}
        <div className="bg-white/80 backdrop-blur-xs border border-dashed border-gray-300 rounded-xl p-3 flex items-center justify-between text-xs text-gray-500">
          <span className="font-mono text-[11px]">🛠️ 测试演示工具箱:</span>
          <div className="flex space-x-2">
            <button
              onClick={handleNextDay}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              title="模拟进入下一天以体验连续打卡返现"
            >
              <FastForward className="w-3 h-3" />
              <span>模拟进入下一天 (Day {state.currentDay < 14 ? state.currentDay + 1 : 14})</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-2 py-1 hover:text-red-600 rounded-lg transition"
              title="重置为初始状态"
            >
              <RotateCcw className="w-3 h-3" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </main>

      {/* Quiz Modal */}
      {activeQuizMode && (
        <QuizModal
          mode={activeQuizMode}
          questions={currentQuizQuestions}
          onClose={() => setActiveQuizMode(null)}
          onCompleteSession={handleCompleteSession}
          isTodayDone={isTodayDone}
          onSaveVocab={handleSaveVocab}
          savedVocabIds={state.savedVocab.map((v) => v.id)}
        />
      )}

      {/* Vocab Knowledge Modal */}
      {showVocabModal && (
        <VocabModal
          savedVocab={state.savedVocab}
          onClose={() => setShowVocabModal(false)}
          onRemoveVocab={handleRemoveVocab}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#E2DFD6] py-4 text-center text-xs text-stone-500">
        MindOverSmoke 智熄 · 基于认知负荷与注意占用理论 · The Economist Style
      </footer>
    </div>
  );
}
