import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SosPanicButton from './components/SosPanicButton';
import ContractDashboard from './components/ContractDashboard';
import BiologicalTracker from './components/BiologicalTracker';
import QuizModal from './components/QuizModal';
import VocabModal from './components/VocabModal';

import { 
  generateSessionTasks, 
  getReplacementTask, 
  taskStats 
} from './utils/taskManager';
import { getInitialState, saveState } from './utils/storage';
import { FastForward, RotateCcw, Zap, ExternalLink, ShieldAlert } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(getInitialState);

  // Directly enter emergency SOS intervention mode upon opening the app/icon
  // (unless user explicitly visits with ?mode=dashboard)
  const [activeQuizMode, setActiveQuizMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'dashboard' ? null : 'sos';
  });

  const [currentQuizQuestions, setCurrentQuizQuestions] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'dashboard' ? [] : generateSessionTasks('sos');
  });

  const [showVocabModal, setShowVocabModal] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const isTodayDone = !!state.completedDays[state.currentDay - 1];

  // Start a quiz session (SOS or practice)
  const handleStartQuiz = (mode) => {
    const tasks = generateSessionTasks(mode);
    setCurrentQuizQuestions(tasks);
    setActiveQuizMode(mode);
  };

  // Swap a specific task with a different one (e.g. if user is on subway and can't do push-ups)
  const handleSwapTask = (indexToSwap) => {
    setCurrentQuizQuestions((prev) => {
      const taskToReplace = prev[indexToSwap];
      const existingIds = prev.map((t) => t.id);
      const replacement = getReplacementTask(taskToReplace, existingIds);
      const next = [...prev];
      next[indexToSwap] = replacement;
      return next;
    });
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

  // Save vocab item (only applies to Economist vocab)
  const handleSaveVocab = (question) => {
    if (!question.vocab) return;
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
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-stone-900">
      <Header 
        state={state} 
        onOpenVocab={() => setShowVocabModal(true)} 
        onResetDemo={handleReset}
      />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 pb-12">
        {/* Emergency First-Aid Status Pill - Editorial Monochrome */}
        <div className="bg-white border border-[#E5E0D8] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-stone-700 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-stone-900"></span>
            <span className="font-mono font-bold text-stone-900">FIRST AID READY</span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500 hidden sm:inline font-sans">点击图标零延迟秒入 3 分钟阻断</span>
          </div>
          <button
            onClick={() => handleStartQuiz('sos')}
            className="flex items-center space-x-1 font-mono font-bold text-stone-900 hover:text-black border-b border-stone-900 cursor-pointer"
          >
            <span>[ 立即急救 ]</span>
          </button>
        </div>

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
        <div className="bg-white/80 backdrop-blur-xs border border-dashed border-gray-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <span>🛠️ 测试与急救演示工具箱:</span>
            <span className="text-emerald-700 font-semibold">({taskStats.total}项全任务池)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStartQuiz('sos')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition shadow-xs"
              title="模拟用户点击桌面应用图标直接唤起急救阻断"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>模拟图标冷启动</span>
            </button>
            <button
              onClick={handleNextDay}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              title="模拟进入下一天以体验连续打卡返现"
            >
              <FastForward className="w-3 h-3" />
              <span>Day {state.currentDay < 14 ? state.currentDay + 1 : 14}</span>
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

      {/* Quiz / Intervention Modal */}
      {activeQuizMode && (
        <QuizModal
          mode={activeQuizMode}
          questions={currentQuizQuestions}
          onClose={() => setActiveQuizMode(null)}
          onCompleteSession={handleCompleteSession}
          isTodayDone={isTodayDone}
          onSaveVocab={handleSaveVocab}
          savedVocabIds={state.savedVocab.map((v) => v.id)}
          onSwapTask={handleSwapTask}
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
        MindOverSmoke 智熄 · 跨模态急救认知阻断舱 · The Economist & Classic Wisdom
      </footer>
    </div>
  );
}
