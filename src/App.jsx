import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SosPanicButton from './components/SosPanicButton';
import ContractDashboard from './components/ContractDashboard';
import QuizModal from './components/QuizModal';
import VocabModal from './components/VocabModal';
import ReflectionCard from './components/ReflectionCard';
import { claimReflectionPrompt } from './utils/reflection';

import { 
  generateSessionTasks, 
  getReplacementTask, 
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
import { ChevronRight, RotateCcw } from 'lucide-react';

const HISTORY_LIMIT = 50;
const liveEntry = (task, entryId = 1) => ({ entryId, task, outcome: 'live' });

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
  const [questionHistory, setQuestionHistory] = useState(() => {
    const restored = savedSession?.history;
    const currentTask = currentQuizQuestions[savedSession?.currentIndex || 0];
    return Array.isArray(restored) && restored.length && restored.at(-1)?.task?.id === currentTask?.id
      ? restored
      : currentTask ? [liveEntry(currentTask)] : [];
  });
  const historyRef = useRef(questionHistory);
  const swapLockRef = useRef(false);
  useEffect(() => { swapLockRef.current = false; }, [currentQuizQuestions]);
  const updateHistory = (next) => {
    historyRef.current = next;
    setQuestionHistory(next);
  };
  const appendHistory = (task, outcome, result) => {
    const previous = historyRef.current;
    const entryId = (previous.at(-1)?.entryId || 0) + 1;
    updateHistory([
      ...previous.slice(-(HISTORY_LIMIT - 1), -1),
      { ...previous.at(-1), outcome, ...(result ? { result } : {}) },
      liveEntry(task, entryId)
    ]);
  };
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
  const challengeFinished = challengeView?.days.every(({ status }) =>
    ['smoke_free', 'smoked', 'expired'].includes(status)
  );

  // Start a quiz session (SOS or practice)
  const handleStartQuiz = (mode) => {
    const reflectionPrompt = claimReflectionPrompt('task');
    const tasks = generateSessionTasks(mode, { reflectionAspectIndex: reflectionPrompt.aspectIndex });
    const nextSosPrompt = null;
    const nextPracticePrompt = null;
    setCurrentQuizQuestions(tasks);
    updateHistory([liveEntry(tasks[0])]);
    setActiveQuizMode(mode);
    setSosPrompt(nextSosPrompt);
    setPracticePrompt(nextPracticePrompt);
    setSessionProgress({ currentIndex: 0, secondsLeft: 180, practiceIntroDismissed: true });
    saveActiveSession({
      mode,
      questions: tasks,
      history: [liveEntry(tasks[0])],
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
      history: historyRef.current,
      ...sessionProgress,
      sosPrompt: kind === 'sos' ? nextPrompt : sosPrompt,
      practicePrompt: kind === 'practice' ? nextPrompt : practicePrompt
    });
  };

  // SOS changes the displayed format independently of completed task types.
  const handleSwapTask = (indexToSwap, { stayInCategory = false } = {}) => {
    if (swapLockRef.current) return;
    const taskToReplace = currentQuizQuestions[indexToSwap];
    if (!taskToReplace) return;
    swapLockRef.current = true;
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
    appendHistory(replacement, 'skipped');
    setCurrentQuizQuestions(next);
    saveActiveSession({
      mode: activeQuizMode || 'sos',
      questions: next,
      history: historyRef.current,
      ...sessionProgress,
      currentIndex: indexToSwap,
      sosPrompt,
      practicePrompt
    });
  };

  const handleAdvanceTask = (completedIndex, secondsLeft, result) => {
    const completedTask = currentQuizQuestions[completedIndex];
    if (!completedTask || completedIndex >= currentQuizQuestions.length - 1) return;
    const next = [...currentQuizQuestions];
    if (activeQuizMode === 'sos') {
      next[completedIndex + 1] = getReplacementTask(
        completedTask,
        next.slice(0, completedIndex + 1).map((task) => task.id),
        'sos'
      );
    }
    appendHistory(next[completedIndex + 1], 'completed', result);
    const progress = { ...sessionProgress, currentIndex: completedIndex + 1, secondsLeft };
    setCurrentQuizQuestions(next);
    setSessionProgress(progress);
    saveActiveSession({
      mode: 'sos',
      questions: next,
      history: historyRef.current,
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
        history: historyRef.current,
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
    if (!window.confirm('重置挑战、词库和急救次数？生活记录不会删除。')) return;
    localStorage.removeItem('mind_over_smoke_state_v2');
    localStorage.removeItem('mind_over_smoke_state_v1');
    setState(getInitialState());
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-stone-900">
      <Header 
        state={state} 
        onOpenVocab={() => setShowVocabModal(true)} 
      />

      <main className="mx-auto w-full max-w-xl flex-1 space-y-5 px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
        <SosPanicButton onStartQuiz={handleStartQuiz} />

        <div className="divide-y divide-[#E5E0D8] border-y border-[#E5E0D8]">
          <details data-panel="challenge" className="group py-1">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-stone-900">
                  {challengeView?.nextReport
                    ? `第 ${challengeView.nextReport.number} 天待申报`
                    : challengeFinished
                      ? '14 天体验已结束'
                      : '14 天无烟挑战'}
                </span>
                <span className="mt-0.5 block text-xs text-stone-500">
                  {challengeView?.nextReport
                    ? `截止 ${challengeView.nextReport.deadline} · 点击申报`
                    : challengeView
                      ? `${challengeView.currentDay === 0 ? '准备日' : `第 ${challengeView.currentDay} 天`} · 自报无烟 ${challengeView.smokeFreeCount} 天`
                      : '免费体验 · 查看挑战'}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="pb-5 pt-2">
              <ContractDashboard
                state={state}
                view={challengeView}
                onStart={handleStartChallenge}
                onReport={handleReport}
              />
            </div>
          </details>

          <details data-panel="reflection" className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-medium text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 [&::-webkit-details-marker]:hidden">
              生活的一角
              <ChevronRight className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="pb-5 pt-2"><ReflectionCard /></div>
          </details>
        </div>
      </main>

      {/* Quiz / Intervention Modal */}
      {activeQuizMode && (
        <QuizModal
          mode={activeQuizMode}
          questions={currentQuizQuestions}
          history={questionHistory}
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

      <footer className="mx-auto w-full max-w-xl px-4 pb-6 text-xs text-stone-500 sm:px-6">
        <details className="group">
          <summary className="w-fit cursor-pointer list-none py-2 underline decoration-stone-300 underline-offset-4 [&::-webkit-details-marker]:hidden">关于与设置</summary>
          <div className="space-y-3 pb-2 pt-2 leading-relaxed">
            <p>这是免费体验，记录仅保存在当前浏览器；不会收款或退款。</p>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900">
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              重置体验数据
            </button>
          </div>
        </details>
      </footer>
    </div>
  );
}
