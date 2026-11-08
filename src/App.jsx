import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SosPanicButton from './components/SosPanicButton';
import ContractDashboard from './components/ContractDashboard';
import BiologicalTracker from './components/BiologicalTracker';
import QuizModal from './components/QuizModal';
import VocabModal from './components/VocabModal';
import ReflectionCard from './components/ReflectionCard';
import { claimReflectionPrompt } from './utils/reflection';

import { 
  generateSessionTasks, 
  getReplacementTask, 
  taskStats,
  allTasks
} from './utils/taskManager';
import { 
  getInitialState, 
  saveState, 
  getSavedSession, 
  saveActiveSession, 
  clearActiveSession 
} from './utils/storage';
import { createChallenge, getChallengeView, recordReport } from './utils/challenge';
import { RotateCcw, Zap } from 'lucide-react';

export default function App() {
  const [state, setState] = useState(getInitialState);

  // Restore or initialize emergency SOS session state
  const savedSession = getSavedSession();

  const [activeQuizMode, setActiveQuizMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'dashboard') return null;
    return savedSession?.mode || 'sos';
  });

  const [currentQuizQuestions, setCurrentQuizQuestions] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'dashboard') return [];
    // StrictMode can call this initializer twice; reuse the session written by the first call.
    const sessionToRestore = getSavedSession() || savedSession;
    if (sessionToRestore?.questions?.length) {
      // Re-hydrate questions against current task pool to guarantee latest definitions & no stale schemas
      return sessionToRestore.questions.map((q) => {
        const fresh = allTasks.find((t) => t.id === q.id);
        if (fresh) return fresh;
        const usedIds = sessionToRestore.questions.map((task) => task.id);
        return allTasks.find((task) => task.category === 'breathing' && !usedIds.includes(task.id))
          || getReplacementTask(q, usedIds);
      });
    }
    const reflectionPrompt = claimReflectionPrompt('task');
    const initialTasks = generateSessionTasks('sos', { reflectionAspectIndex: reflectionPrompt.aspectIndex });
    saveActiveSession({
      mode: 'sos',
      questions: initialTasks,
      currentIndex: 0,
      secondsLeft: 180,
      sosPrompt: null
    });
    return initialTasks;
  });

  const [sessionProgress, setSessionProgress] = useState(() => ({
    currentIndex: savedSession?.currentIndex || 0,
    secondsLeft: savedSession?.secondsLeft ?? 180,
    practiceIntroDismissed: savedSession?.practiceIntroDismissed ?? true
  }));
  const [sosPrompt, setSosPrompt] = useState(() => getSavedSession()?.sosPrompt || null);
  const [practicePrompt, setPracticePrompt] = useState(() => savedSession?.practicePrompt || null);

  const [showVocabModal, setShowVocabModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Sync to local storage
  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const challengeView = getChallengeView(state.challenge, now);

  // Start a quiz session (SOS or practice)
  const handleStartQuiz = (mode) => {
    const reflectionPrompt = claimReflectionPrompt('task');
    const tasks = generateSessionTasks(mode, { reflectionAspectIndex: reflectionPrompt.aspectIndex });
    const nextSosPrompt = null;
    const nextPracticePrompt = null;
    setCurrentQuizQuestions(tasks);
    setActiveQuizMode(mode);
    setSosPrompt(nextSosPrompt);
    setPracticePrompt(nextPracticePrompt);
    setSessionProgress({ currentIndex: 0, secondsLeft: 180, practiceIntroDismissed: true });
    saveActiveSession({
      mode,
      questions: tasks,
      currentIndex: 0,
      secondsLeft: 180,
      practiceIntroDismissed: true,
      sosPrompt: nextSosPrompt,
      practicePrompt: nextPracticePrompt
    });
  };

  const handleChangeReflectionAspect = (kind) => {
    const nextPrompt = claimReflectionPrompt('manual');
    if (kind === 'sos') setSosPrompt(nextPrompt);
    else setPracticePrompt(nextPrompt);
    saveActiveSession({
      mode: activeQuizMode,
      questions: currentQuizQuestions,
      ...sessionProgress,
      sosPrompt: kind === 'sos' ? nextPrompt : sosPrompt,
      practicePrompt: kind === 'practice' ? nextPrompt : practicePrompt
    });
  };

  // SOS changes the displayed format independently of completed task types.
  const handleSwapTask = (indexToSwap, { stayInCategory = false } = {}) => {
    const taskToReplace = currentQuizQuestions[indexToSwap];
    if (!taskToReplace) return;
    const currentAspect = currentQuizQuestions[indexToSwap]?.aspectIndex;
    let nextAspect = null;
    if (taskToReplace.category === 'reflection' && stayInCategory) {
      for (let attempt = 0; attempt < 5; attempt++) {
        nextAspect = claimReflectionPrompt('task').aspectIndex;
        if (nextAspect !== currentAspect) break;
      }
      if (nextAspect === currentAspect) nextAspect = (currentAspect + 1) % 5;
    }
    const existingIds = (activeQuizMode === 'sos'
      ? currentQuizQuestions.slice(0, indexToSwap + 1)
      : currentQuizQuestions).map((task) => task.id);
    const replacement = taskToReplace.category === 'reflection' && stayInCategory
      ? allTasks.find((task) => task.category === 'reflection' && task.aspectIndex === nextAspect)
      : getReplacementTask(taskToReplace, existingIds, activeQuizMode || 'sos');
    const next = [...currentQuizQuestions];
    next[indexToSwap] = replacement;
    setCurrentQuizQuestions(next);
    saveActiveSession({
      mode: activeQuizMode || 'sos',
      questions: next,
      ...sessionProgress,
      currentIndex: indexToSwap,
      sosPrompt,
      practicePrompt
    });
  };

  const handleAdvanceTask = (completedIndex, secondsLeft) => {
    if (activeQuizMode !== 'sos') return;
    const completedTask = currentQuizQuestions[completedIndex];
    if (!completedTask || completedIndex >= currentQuizQuestions.length - 1) return;
    const next = [...currentQuizQuestions];
    next[completedIndex + 1] = getReplacementTask(
      completedTask,
      next.slice(0, completedIndex + 1).map((task) => task.id),
      'sos'
    );
    const progress = { ...sessionProgress, currentIndex: completedIndex + 1, secondsLeft };
    setCurrentQuizQuestions(next);
    setSessionProgress(progress);
    saveActiveSession({
      mode: 'sos',
      questions: next,
      ...progress,
      sosPrompt,
      practicePrompt
    });
  };

  // Progress update from QuizModal (e.g. index change, timer tick)
  const handleQuizProgress = ({ currentIndex, secondsLeft, practiceIntroDismissed }) => {
    setSessionProgress({ currentIndex, secondsLeft, practiceIntroDismissed });
    if (activeQuizMode && currentQuizQuestions.length > 0) {
      saveActiveSession({
        mode: activeQuizMode,
        questions: currentQuizQuestions,
        currentIndex,
        secondsLeft,
        practiceIntroDismissed,
        sosPrompt,
        practicePrompt
      });
    }
  };

  // Close quiz session manually
  const handleCloseQuiz = () => {
    setActiveQuizMode(null);
    setSosPrompt(null);
    setPracticePrompt(null);
    clearActiveSession();
  };

  // Complete a quiz session
  const handleCompleteSession = () => {
    clearActiveSession();
    setState((prev) => ({
      ...prev,
      totalCravingsIntercepted: prev.totalCravingsIntercepted + 1
    }));
  };

  const handleStartChallenge = () => {
    setState((prev) => prev.challenge ? prev : { ...prev, challenge: createChallenge() });
    setNow(Date.now());
  };

  const handleReport = (dayNumber, result) => {
    setState((prev) => {
      try {
        return { ...prev, challenge: recordReport(prev.challenge, dayNumber, result) };
      } catch {
        return prev;
      }
    });
    setNow(Date.now());
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

  // Demo tool: reset state
  const handleReset = () => {
    localStorage.removeItem('mind_over_smoke_state_v2');
    localStorage.removeItem('mind_over_smoke_state_v1');
    setState(getInitialState());
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-stone-900">
      <Header 
        state={state} 
        smokeFreeCount={challengeView?.smokeFreeCount || 0}
        onOpenVocab={() => setShowVocabModal(true)} 
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
        />

        {/* Optional reflection from the time-use diary; separate from SOS and smoke-free reports. */}
        <ReflectionCard />

        {/* 14-Day Commitment Contract & Rebate Matrix */}
        <ContractDashboard 
          state={state} 
          view={challengeView}
          onStart={handleStartChallenge}
          onReport={handleReport}
        />

        {/* Biological and Financial ROI Health Tracker */}
        <BiologicalTracker 
          state={state} 
          smokeFreeCount={challengeView?.smokeFreeCount || 0}
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
          initialIndex={sessionProgress.currentIndex}
          initialSecondsLeft={sessionProgress.secondsLeft}
          onProgress={handleQuizProgress}
          onClose={handleCloseQuiz}
          onCompleteSession={handleCompleteSession}
          onSaveVocab={handleSaveVocab}
          savedVocabIds={state.savedVocab.map((v) => v.id)}
          onSwapTask={handleSwapTask}
          onAdvanceTask={handleAdvanceTask}
          sosPrompt={sosPrompt}
          practicePrompt={practicePrompt}
          initialIntroDismissed={sessionProgress.practiceIntroDismissed}
          onRequestSosPrompt={() => handleChangeReflectionAspect('sos')}
          onSwapSosAspect={() => handleChangeReflectionAspect('sos')}
          onSwapPracticeAspect={() => handleChangeReflectionAspect('practice')}
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
