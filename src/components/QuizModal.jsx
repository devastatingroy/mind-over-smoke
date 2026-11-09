import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Timer, 
  Check, 
  ArrowRight, 
  TrendingDown,
  Dumbbell,
  Scroll,
  BookOpen,
  Wind,
  Shuffle,
  Volume2,
  Play,
  RotateCcw,
  Languages,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  HelpCircle
} from 'lucide-react';
import { lookupWord } from '../utils/phoneticDict';
import { splitInteractiveText } from '../utils/wordTokens';
import ReflectionQuestion from './ReflectionQuestion';

export default function QuizModal({ 
  mode, 
  questions, 
  initialIndex = 0,
  initialSecondsLeft = 180,
  onClose, 
  onCompleteSession, 
  onSaveVocab,
  savedVocabIds,
  onSwapTask,
  onAdvanceTask,
  onProgress,
  sosPrompt,
  practicePrompt,
  initialIntroDismissed = true,
  onRequestSosPrompt,
  onSwapSosAspect,
  onSwapPracticeAspect
}) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.min(initialIndex, Math.max(0, (questions?.length || 1) - 1)));
  const [selectedOption, setSelectedOption] = useState(null);
  const [typeInAnswer, setTypeInAnswer] = useState('');
  const [hasWrongAttempt, setHasWrongAttempt] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [inputMode, setInputMode] = useState('choice'); // 'choice' or 'type'
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft); // 3-minute craving countdown
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [showPracticeIntro, setShowPracticeIntro] = useState(mode === 'practice' && !initialIntroDismissed && Boolean(practicePrompt));
  const [showSosReflection, setShowSosReflection] = useState(mode === 'sos' && Boolean(sosPrompt) && initialIndex === 0);

  // Translation & Word Phonetic inspection state
  const [showTranslation, setShowTranslation] = useState(false);
  const [showScaffold, setShowScaffold] = useState(false);
  const [inspectedWord, setInspectedWord] = useState(null);
  const [inspectedSource, setInspectedSource] = useState(null);

  // Physical task state
  const [physicalReps, setPhysicalReps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Breathing task state
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(1);
  const [quotePhase, setQuotePhase] = useState('study');
  const [quoteDeadline, setQuoteDeadline] = useState(null);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState(10);
  const bodyScrollRef = useRef(null);
  const inspectorRef = useRef(null);
  const advanceLockedRef = useRef(false);

  const currentQ = questions[currentIndex] || questions[0];

  // Reset task-specific states when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTypeInAnswer('');
    setHasWrongAttempt(false);
    setInputMode('choice');
    setIsAnswered(false);
    setIsCorrect(false);
    setIsRevealed(false);
    setPhysicalReps(0);
    setTimerSeconds(currentQ?.target_reps || 30);
    setIsTimerRunning(false);
    setBreathingStep(0);
    setBreathingCycle(1);
    setQuotePhase('study');
    setQuoteDeadline(null);
    setQuoteSecondsLeft(10);
    setShowTranslation(false);
    setShowScaffold(false);
    setInspectedWord(null);
    setInspectedSource(null);
    advanceLockedRef.current = false;
    if (bodyScrollRef.current) bodyScrollRef.current.scrollTop = 0;
  }, [currentIndex, currentQ?.id]);

  // The 10-second recitation window uses elapsed time, so background tab throttling
  // cannot silently give a longer countdown. Reloading starts this self-check anew.
  useEffect(() => {
    if (currentQ?.category !== 'film_quote' || quotePhase !== 'reciting' || quoteDeadline === null) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((quoteDeadline - Date.now()) / 1000));
      setQuoteSecondsLeft(remaining);
      if (remaining === 0) setQuotePhase('ready');
    };
    update();
    const interval = window.setInterval(update, 250);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', update);
    };
  }, [currentQ?.id, currentQ?.category, quotePhase, quoteDeadline]);

  // 180s Craving countdown timer
  useEffect(() => {
    if (isSessionFinished || showPracticeIntro) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionFinished, showPracticeIntro]);

  // Sync progress back to parent / session storage for seamless reload recovery
  useEffect(() => {
    if (!isSessionFinished && onProgress) {
      onProgress({ currentIndex, secondsLeft, practiceIntroDismissed: !showPracticeIntro });
    }
  }, [currentIndex, secondsLeft, isSessionFinished, showPracticeIntro]);

  useEffect(() => {
    if (currentIndex > 0) setShowSosReflection(false);
  }, [currentIndex]);

  // Physical timer countdown
  useEffect(() => {
    if (!isTimerRunning || isAnswered) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          setIsCorrect(true);
          setIsAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isAnswered]);

  // Craving wave stage text - Monochrome & Quiet
  const getCravingStage = () => {
    if (secondsLeft > 120) {
      return {
        stageName: '峰值浪涌 (Peak Wave)',
        desc: '注意力正被工作记忆全力接管，深呼吸保持专注。'
      };
    } else if (secondsLeft > 50) {
      return {
        stageName: '冲动消退 (Subsiding)',
        desc: '边缘系统渴求显著回落，自控力已逐步重置。'
      };
    } else {
      return {
        stageName: '受控基线 (Neutralized)',
        desc: '神经回路已平息，你已完全夺回前额叶掌控权。'
      };
    }
  };

  const wave = getCravingStage();

  // Handle option selection
  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    const correct = opt.toString().toLowerCase().trim() === (currentQ.blank || '').toLowerCase().trim();
    setIsCorrect(correct);
    setHasWrongAttempt(!correct);
    setIsAnswered(correct);
  };

  // Handle direct answer reveal (用户点击"看答案")
  const handleRevealAnswer = () => {
    if (isAnswered) return;
    setIsRevealed(true);
    setIsCorrect(false);
    setIsAnswered(true);
  };

  // Handle Mode 1 active recall / verify
  const handleMode1Reveal = (recalled) => {
    if (isAnswered) return;
    setIsRevealed(true);
    setSelectedOption(currentQ.correct_answer);
    setIsCorrect(true);
    setIsAnswered(true);
  };

  // Handle typing submit
  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (!typeInAnswer.trim() || isAnswered) return;
    const correct = typeInAnswer.toLowerCase().trim() === currentQ.blank.toLowerCase().trim();
    setIsCorrect(correct);
    setHasWrongAttempt(!correct);
    setIsAnswered(correct);
  };

  const handleTranslationSubmit = (e) => {
    e.preventDefault();
    if (!typeInAnswer.trim() || isAnswered) return;
    setIsAnswered(true);
  };

  const startQuoteRecitation = () => {
    setQuoteSecondsLeft(10);
    setQuoteDeadline(Date.now() + 10_000);
    setQuotePhase('reciting');
  };

  const revealQuote = () => {
    setQuotePhase('revealed');
    setIsAnswered(true);
  };

  const retryQuote = () => {
    setQuoteDeadline(null);
    setQuoteSecondsLeft(10);
    setQuotePhase('study');
    setIsAnswered(false);
  };

  // Word click to inspect phonetic & definition (严禁自动朗读，仅显示音标与释义)
  const handleWordClick = (rawWord, source) => {
    const data = lookupWord(rawWord);
    if (!data) return;
    setInspectedWord(data);
    setInspectedSource(source);
  };

  // Physical rep click
  const handleRepIncrement = () => {
    if (isAnswered) return;
    const nextReps = physicalReps + 1;
    setPhysicalReps(nextReps);

    if (nextReps >= currentQ.target_reps) {
      setIsCorrect(true);
      setIsAnswered(true);
    }
  };

  // Instant finish physical task
  const handleInstantCompletePhysical = () => {
    setPhysicalReps(currentQ.target_reps);
    setIsCorrect(true);
    setIsAnswered(true);
  };

  // Breathing complete cycle
  const handleNextBreathingCycle = () => {
    if (breathingCycle < (currentQ.target_cycles || 3)) {
      setBreathingCycle((prev) => prev + 1);
    } else {
      setIsCorrect(true);
      setIsAnswered(true);
    }
  };

  // Next question or finish
  const handleNext = () => {
    if (advanceLockedRef.current) return;
    advanceLockedRef.current = true;
    if (currentIndex < questions.length - 1) {
      onAdvanceTask?.(currentIndex, secondsLeft);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
      onCompleteSession();
    }
  };

  const isVocabSaved = currentQ.vocab && savedVocabIds?.includes(currentQ.id);

  useEffect(() => {
    if (inspectedWord) inspectorRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [inspectedWord, inspectedSource]);

  // Render clickable interactive words for English passages
  const renderInteractiveSegment = (text, dark = false, source = 'passage') => {
    if (!text) return null;
    return splitInteractiveText(text).map(({ text: token, word: cleaned }, idx) => {
      if (!cleaned) return <span key={idx}>{token}</span>;
      const entry = lookupWord(cleaned);
      if (!entry?.def || entry.def === '词典暂未收录该词详细释义') return <span key={idx}>{token}</span>;
      const isSelected = inspectedWord?.word === cleaned && inspectedSource === source;
      return (
        <span
          key={idx}
          onClick={() => handleWordClick(cleaned, source)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleWordClick(cleaned, source);
            }
          }}
          role="button"
          tabIndex={0}
          className={`cursor-pointer rounded px-0.5 transition-colors select-text ${
            isSelected
              ? dark ? 'bg-white text-stone-900 font-semibold' : 'bg-stone-900 text-white font-semibold'
              : dark ? 'hover:bg-white/20 hover:text-white hover:underline' : 'hover:bg-stone-200/80 hover:text-stone-900 decoration-stone-300 hover:underline'
          }`}
          title="点击查看音标与释义"
        >
          {token}
        </span>
      );
    });
  };

  const renderWordInspector = () => inspectedWord && (
    <div ref={inspectorRef} className="bg-[#18181B] text-white p-3.5 rounded-xl border border-stone-800 shadow-md flex items-center justify-between animate-fadeIn text-xs">
      <div className="space-y-1 flex-1 min-w-0 pr-2">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="font-serif font-bold text-base text-stone-100 tracking-wide break-all">{inspectedWord.word}</span>
          {inspectedWord.phonetic && (
            <span className="font-mono text-emerald-400 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              {inspectedWord.phonetic}
            </span>
          )}
        </div>
        <p className="text-stone-300 text-[11px] font-sans max-h-20 overflow-y-auto leading-relaxed">
          {inspectedWord.pos && <span className="text-stone-400 italic mr-1">{inspectedWord.pos}</span>}
          {inspectedWord.def}
        </p>
      </div>
      <button
        onClick={() => { setInspectedWord(null); setInspectedSource(null); }}
        className="text-stone-400 hover:text-white p-1 ml-2 cursor-pointer"
        title="关闭"
        aria-label="关闭单词释义"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  // Render passage with blank - Clean Editorial typography
  const renderPassage = (interactive = false) => {
    const isPoetic = currentQ.category === 'poetry' || currentQ.type === 'poetry' || currentQ.category === 'translation' || currentQ.type === 'translation';
    const parts = currentQ.passage.split('________');
    return (
      <div className={`text-[#111827] leading-relaxed ${isPoetic ? 'font-serif text-xl sm:text-2xl text-center py-4 font-bold tracking-wide select-none' : 'font-serif text-lg leading-loose'}`}>
        <span>{interactive ? renderInteractiveSegment(parts[0]) : parts[0]}</span>
        <span className={`inline-block px-3 py-0.5 mx-1.5 font-sans font-semibold rounded transition-all duration-200 border ${
          isAnswered 
            ? (isCorrect 
                ? 'bg-stone-900 text-white border-stone-900' 
                : 'bg-stone-200 text-stone-800 border-stone-300')
            : 'border-stone-900 border-dashed text-stone-700 bg-stone-50/80 animate-pulse'
        }`}>
          {isAnswered ? currentQ.blank : '[  ?  ]'}
        </span>
        <span>{interactive ? renderInteractiveSegment(parts[1]) : parts[1]}</span>
      </div>
    );
  };

  // Monochrome Category Meta Label
  const getCategoryMeta = () => {
    if (currentQ.category === 'reflection') {
      return { code: 'REFLECTION', label: '生活的一角', icon: <Sparkles className="w-3.5 h-3.5" /> };
    }
    if (currentQ.category === 'film_quote') {
      return { code: 'FILM · RECALL', label: '电影台词背诵', icon: <BookOpen className="w-3.5 h-3.5" /> };
    }
    if (currentQ.category === 'visual_imagery') {
      return { code: 'VISUAL · IMAGERY', label: '画面想象', icon: <BookOpen className="w-3.5 h-3.5" /> };
    }
    if (currentQ.category === 'observation_judgment') {
      return { code: 'OBSERVE · REASON', label: '观察与判断', icon: <BookOpen className="w-3.5 h-3.5" /> };
    }
    if (currentQ.type === 'zh_to_en') {
      return {
        code: 'REASONING · TRANSLATION',
        label: '原创论断英译',
        icon: <Languages className="w-3.5 h-3.5" />
      };
    }
    if (currentQ.category === 'translation' || currentQ.type === 'translation') {
      return {
        code: 'TRANSLATION',
        label: currentQ.mode === 'zh_to_en' ? '汉诗英译填空' : '英译唐诗逆向还原',
        icon: <Languages className="w-3.5 h-3.5" />
      };
    }
    if (currentQ.category === 'physical' || currentQ.type === 'physical') {
      return {
        code: 'SOMATIC',
        label: '躯体动作重置',
        icon: <Dumbbell className="w-3.5 h-3.5" />
      };
    }
    if (currentQ.category === 'breathing' || currentQ.type === 'breathing') {
      return {
        code: 'VAGUS',
        label: '迷走神经深呼吸',
        icon: <Wind className="w-3.5 h-3.5" />
      };
    }
    return {
      code: 'COGNITIVE',
      label: '经济学人认知阻断',
      icon: <BookOpen className="w-3.5 h-3.5" />
    };
  };

  const meta = getCategoryMeta();
  const isPoetryTask = currentQ.category === 'translation' || currentQ.type === 'translation' || currentQ.category === 'poetry' || currentQ.type === 'poetry';
  const nextActionLabel = currentIndex < questions.length - 1 ? '继续下一项阻断' : '完成本次急救';
  const showAnsweredAction = isAnswered && !isSessionFinished;
  const swapButton = onSwapTask && (mode === 'sos' || currentQ.category !== 'reflection') && !isSessionFinished && !isAnswered && (
    <button
      type="button"
      onClick={() => onSwapTask(currentIndex)}
      className="w-full min-h-11 px-4 py-3 bg-white hover:bg-[#F5F2EB] text-stone-900 border border-stone-400 hover:border-stone-900 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      title={mode === 'sos' ? '切换到下一种题型，当前题不计为完成' : '更换当前题目，不计为完成'}
    >
      <Shuffle className="w-4 h-4 text-[#8C1D24]" aria-hidden="true" />
      <span>换下一题</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="quiz-modal-panel bg-[#FAF8F5] text-[#111827] rounded-2xl w-full max-w-xl border border-[#E5E0D8] shadow-xl overflow-hidden flex flex-col sm:my-auto">
        
        {/* Top Masthead: Editorial Monolith */}
        <div className="bg-white px-5 py-3.5 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 min-w-0">
            <span className="bg-[#8C1D24] text-white text-[9px] font-serif font-black px-1.5 py-0.5 tracking-wider uppercase shrink-0">
              THE
            </span>
            <span className="text-xs font-serif font-bold text-stone-900 tracking-tight truncate">
              MindOverSmoke
            </span>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-mono font-medium text-stone-500 shrink-0">
              {showPracticeIntro ? '思考问题' : `${currentIndex + 1}/${questions.length}`}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* 180s Countdown Badge */}
            <div className="flex items-center space-x-1 text-xs font-mono font-semibold text-stone-800 bg-stone-100 px-2 py-1 rounded shrink-0">
              <Timer className="w-3.5 h-3.5 text-stone-900" />
              <span>{showPracticeIntro ? '未开始' : `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`}</span>
            </div>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-900 p-1 rounded transition cursor-pointer"
              title="关闭并返回看板"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quiet Hairline Wave Gauge */}
        {!showPracticeIntro && <div className="bg-[#F5F2EB] px-5 py-2 border-b border-[#E5E0D8]">
          <div className="flex items-center justify-between text-[11px] font-sans mb-1 text-stone-600">
            <span className="font-medium text-stone-800">
              {wave.stageName}
            </span>
            <span className="font-mono text-[10px] text-stone-500">
              {secondsLeft}s REMAINING
            </span>
          </div>
          <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-900 transition-all duration-1000 ease-out"
              style={{ width: `${Math.max(5, (secondsLeft / 180) * 100)}%` }}
            />
          </div>
        </div>}

        {showAnsweredAction && (
          <div data-quiz-continue="top" className="shrink-0 border-b border-[#E5E0D8] bg-[#FAF8F5] px-5 py-2.5 sm:px-6">
            <button
              type="button"
              onClick={handleNext}
              aria-label={`${nextActionLabel}（顶部操作）`}
              className="w-full min-h-11 px-4 py-2.5 bg-white hover:bg-[#F5F2EB] text-stone-900 border border-stone-400 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <span>{nextActionLabel}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div ref={bodyScrollRef} className="min-h-0 p-5 sm:p-6 overflow-y-auto overscroll-contain space-y-5">
          {!isSessionFinished ? (
            showPracticeIntro && practicePrompt ? (
              <ReflectionQuestion prompt={practicePrompt} onSwapAspect={onSwapPracticeAspect} onContinue={() => setShowPracticeIntro(false)} />
            ) : (
            <>
              {mode === 'sos' && !questions.some((task) => task.category === 'reflection') && (
                <div>
                  {!showSosReflection && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!sosPrompt) onRequestSosPrompt();
                        setShowSosReflection(true);
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                    >
                      看看生活问题
                    </button>
                  )}
                  {showSosReflection && sosPrompt && (
                    <ReflectionQuestion prompt={sosPrompt} compact onSwapAspect={onSwapSosAspect} onDismiss={() => setShowSosReflection(false)} />
                  )}
                </div>
              )}
              {swapButton}
              {/* Category Subhead */}
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-stone-200/80">
                <div className="flex items-center space-x-1.5 font-mono text-[11px] tracking-wide text-stone-600">
                  {meta.icon}
                  <span>{meta.code}</span>
                  <span>·</span>
                  <span className="font-sans text-stone-900 font-medium">{meta.label}</span>
                </div>
                {currentQ.theme && (
                  <span className="font-serif italic text-stone-500 text-[11px] hidden sm:inline">
                    {currentQ.theme}
                  </span>
                )}
              </div>

              {currentQ.category === 'reflection' && (
                <div className="space-y-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{currentQ.title}</h2>
                  <ReflectionQuestion
                    prompt={{ aspectIndex: currentQ.aspectIndex }}
                    onSwapAspect={() => onSwapTask(currentIndex, { stayInCategory: true })}
                    onContinue={handleNext}
                    continueLabel={currentIndex < questions.length - 1 ? '想过了，继续下一项' : '完成本次急救'}
                  />
                </div>
              )}

              {['visual_imagery', 'observation_judgment'].includes(currentQ.category) && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-3">
                    <h2 className="font-serif text-xl font-bold text-stone-900">{currentQ.title}</h2>
                    <p className="text-sm leading-relaxed text-stone-800">{currentQ.prompt}</p>
                    {currentQ.category === 'observation_judgment' ? (
                      <p className="text-xs leading-relaxed text-stone-600">例如：{currentQ.example}</p>
                    ) : (
                      <details className="text-xs text-stone-600">
                        <summary className="cursor-pointer underline underline-offset-4">看一个例子</summary>
                        <p className="mt-2 leading-relaxed">{currentQ.example}</p>
                      </details>
                    )}
                  </div>
                  <p className="text-xs text-stone-600">在脑中想或说出来即可，无需填写，也不评分。</p>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full min-h-11 p-3 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-black cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                  >
                    {currentIndex < questions.length - 1 ? '想好了，继续下一项' : mode === 'practice' ? '完成本轮练习' : '完成本次急救'}
                  </button>
                </div>
              )}

              {currentQ.category === 'film_quote' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-600">
                      <span className="font-semibold text-stone-900">《{currentQ.film}》 · {currentQ.year}</span>
                      <span className="font-mono text-[11px]">{currentQ.language === 'zh' ? '中文原声' : 'ENGLISH ORIGINAL'}</span>
                    </div>
                    <p role="status" aria-live="polite" className="text-xs text-stone-600">
                      {quotePhase === 'study' && '读一遍台词，准备好后开始 10 秒背诵。'}
                      {quotePhase === 'reciting' && `台词已隐藏 · 请在 ${quoteSecondsLeft} 秒内背出，可默念。`}
                      {quotePhase === 'ready' && '10 秒结束。现在核对原句。'}
                      {quotePhase === 'revealed' && '对照原句自行核对，不做语音评分。'}
                    </p>
                    {(quotePhase === 'study' || quotePhase === 'revealed') ? (
                      <blockquote lang={currentQ.language === 'zh' ? 'zh-CN' : 'en'} className="font-serif text-xl sm:text-2xl leading-relaxed text-stone-900 border-l-2 border-[#8C1D24] pl-4 select-text whitespace-pre-line">
                        {currentQ.quote}
                      </blockquote>
                    ) : (
                      <div className="min-h-24 flex items-center justify-center rounded-lg bg-[#F5F2EB] border border-stone-200 text-stone-700 font-mono text-sm">
                        {quotePhase === 'reciting' ? `背诵倒计时 ${quoteSecondsLeft}s` : '台词已隐藏'}
                      </div>
                    )}
                    {(quotePhase === 'study' || quotePhase === 'revealed') && (
                      <p className="text-[11px] text-stone-500 text-right">{currentQ.speaker}</p>
                    )}
                  </div>
                  {quotePhase === 'study' && (
                    <button type="button" onClick={startQuoteRecitation} className="w-full min-h-11 p-3 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-black cursor-pointer">
                      记住了，开始 10 秒背诵
                    </button>
                  )}
                  {quotePhase === 'ready' && (
                    <div className="space-y-2">
                      <button type="button" onClick={revealQuote} className="w-full min-h-11 p-3 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-black cursor-pointer">
                        核对原句
                      </button>
                      <button type="button" onClick={retryQuote} className="w-full min-h-11 p-3 bg-white border border-stone-300 text-stone-900 rounded-xl font-semibold text-sm cursor-pointer">
                        再背一次
                      </button>
                    </div>
                  )}
                  {quotePhase === 'revealed' && (
                    <button type="button" onClick={handleNext} className="w-full min-h-11 p-3 bg-stone-900 text-white rounded-xl font-semibold text-sm hover:bg-black cursor-pointer">
                      {nextActionLabel}
                    </button>
                  )}
                </div>
              )}

              {/* ---------------- 1. TRANSLATION COGNITIVE CHALLENGE ---------------- */}
              {(currentQ.category === 'translation' || currentQ.type === 'translation') && (
                <div className="space-y-4">
                  {/* Mode 1: English to Chinese Classical Reconstruction */}
                  {currentQ.mode === 'en_to_zh' ? (
                    <>
                      {/* Masterpiece English Quote Card */}
                      <div className="bg-[#18181B] text-white p-5 rounded-xl border border-stone-800 shadow-sm relative">
                        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-stone-400 mb-2.5">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3 text-[#8C1D24]" />
                            <span>ENGLISH RENDERING</span>
                          </span>
                          <span className="text-stone-300 font-sans">{currentQ.translator}</span>
                        </div>
                        <blockquote className="font-serif italic text-lg sm:text-xl text-stone-100 leading-relaxed border-l-2 border-[#8C1D24] pl-4 py-0.5 select-text">
                          "{renderInteractiveSegment(currentQ.english_text, true)}"
                        </blockquote>
                        <div className="mt-2 text-[10px] text-stone-400 font-sans flex items-center justify-end">
                          <span>💡 点击英文单词查看音标与释义</span>
                        </div>
                      </div>

                      {/* Classical Reconstruction Context Card (NO Chinese Spoilers!) */}
                      <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                        <div className="text-xs text-stone-500 flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-serif text-stone-800 font-bold text-sm">
                            {currentQ.author} · {currentQ.title}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                            CHINESE RECONSTRUCTION
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed font-sans">
                          💡 {currentQ.prompt}
                        </p>

                        {/* If Answered: Reveal the original full verse */}
                        {isAnswered && (
                          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 text-center space-y-1">
                            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                              古典名作原文节选
                            </div>
                            <p className="font-serif text-base sm:text-lg font-bold text-stone-800 tracking-wide">
                              {currentQ.full_verse}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* NO MULTIPLE CHOICE! PURE ACTIVE RETRIEVAL & REVEAL */}
                      {!isAnswered ? (
                        <div className="space-y-3 pt-1">
                          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 text-center space-y-1.5">
                            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest flex items-center justify-center space-x-1">
                              <span>🧠 前额叶自主提取挑战 · 拒绝选择题剧透</span>
                            </div>
                            <p className="font-serif text-xs sm:text-sm text-stone-700 leading-relaxed">
                              观察上方英译意象，闭目深思：在脑海中回忆并念出对应的千古名句。
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button
                              onClick={() => handleMode1Reveal(true)}
                              className="py-3.5 px-4 bg-stone-900 hover:bg-black text-white rounded-xl font-medium text-sm transition shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                            >
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>🎯 我想到了 · 揭晓原诗对照</span>
                            </button>
                            <button
                              onClick={() => handleMode1Reveal(false)}
                              className="py-3.5 px-4 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl font-medium text-sm transition cursor-pointer flex items-center justify-center space-x-2"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                              <span>❓ 暂时想不出 · 直接看答案</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Revealed Master Verse Card */
                        <div className="space-y-3 pt-1 animate-fadeIn">
                          <div className="p-5 sm:p-6 bg-[#18181B] text-white rounded-xl border border-stone-800 shadow-md text-center space-y-2">
                            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center justify-center space-x-1">
                              <span className="text-emerald-400">✦</span>
                              <span>古典名作原句 · 正解</span>
                              <span className="text-emerald-400">✦</span>
                            </div>
                            <p className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-stone-100 py-1">
                              {currentQ.correct_answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Mode 2: Chinese to English free response */
                    <>
                      {/* Classical Chinese Quote Card */}
                      <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                        <div className="text-xs text-stone-500 flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-serif text-stone-800 font-bold text-sm">
                            {currentQ.author} · {currentQ.title}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                            CHINESE TO ENGLISH TRANSLATION
                          </span>
                        </div>

                        <blockquote className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-relaxed border-l-2 border-[#8C1D24] pl-4 py-1">
                          “{currentQ.chinese_verse}”
                        </blockquote>

                        <p className="text-xs text-stone-700 leading-relaxed font-sans pt-1">
                          💡 {currentQ.prompt}
                        </p>
                      </div>

                      {/* Write a translation before viewing the reference rendition */}
                      {!isAnswered ? (
                        <div className="space-y-2.5">
                          <form onSubmit={handleTranslationSubmit} className="space-y-2.5">
                            <label htmlFor="translation-answer" className="block text-xs font-medium text-stone-700">
                              请写出你的英文译文
                            </label>
                            <textarea
                              id="translation-answer"
                              value={typeInAnswer}
                              onChange={(e) => setTypeInAnswer(e.target.value)}
                              rows={3}
                              placeholder="根据原诗意象，用英文写出完整译文…"
                              className="w-full p-3.5 bg-white border border-stone-300 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-stone-900"
                            />
                            <button type="submit" disabled={!typeInAnswer.trim()} className="w-full py-3 bg-stone-900 hover:bg-black disabled:opacity-40 text-white rounded-xl font-medium text-sm cursor-pointer disabled:cursor-not-allowed">
                              提交并对照参考译文
                            </button>
                          </form>
                          <button
                            onClick={handleRevealAnswer}
                            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition text-center cursor-pointer border border-dashed border-stone-300 font-sans flex items-center justify-center space-x-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                            <span>暂时想不出？点击看参考译文</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          {typeInAnswer.trim() && (
                            <div className="p-4 bg-white rounded-xl border border-stone-200 text-sm">
                              <div className="text-[10px] font-mono text-stone-500 mb-1">你的译文</div>
                              <p className="font-serif italic text-stone-800 whitespace-pre-wrap">{typeInAnswer.trim()}</p>
                            </div>
                          )}
                          <div className="p-4 bg-stone-900 text-white rounded-xl text-sm">
                            <div className="text-[10px] font-mono text-stone-300 mb-1">参考译文 · 可有其他合理译法</div>
                            <p className="font-serif italic leading-relaxed whitespace-pre-wrap select-text">
                              {renderInteractiveSegment(currentQ.correct_answer, true)}
                            </p>
                            <div className="mt-2 text-[10px] text-stone-300 font-sans text-right">
                              点击英文单词查看音标与释义
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Word Inspector Floating Card (in case user clicked a word) */}
                  {inspectedWord && inspectedSource !== 'verdict' && renderWordInspector()}

                  {/* Bilingual Mapping Table when answered */}
                  {isAnswered && currentQ.mapping && (
                    <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] text-xs space-y-2.5">
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span>BILINGUAL SEMANTIC MAPPING · 意象转码对照</span>
                        <span className="font-sans text-[10px] text-stone-400">词意精准咬合</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {currentQ.mapping.map((m, idx) => (
                          <div key={idx} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs">
                            <span className="font-serif italic text-stone-700 break-words min-w-0 sm:flex-1">{m.en}</span>
                            <span className="flex items-center gap-1.5 sm:shrink-0">
                              <span className="text-stone-400 font-mono">⇄</span>
                              <span className="font-bold text-stone-900">{m.zh}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Original Chinese claim -> English reasoning challenge */}
              {currentQ.type === 'zh_to_en' && (
                <div className="space-y-3.5">
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                    <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider border-b border-stone-100 pb-2">
                      ORIGINAL CLAIM · 中文论断英译
                    </div>
                    <blockquote className="font-serif text-lg sm:text-xl font-semibold text-stone-900 leading-relaxed border-l-2 border-[#8C1D24] pl-4">
                      {currentQ.chinese_claim}
                    </blockquote>
                    <p className="text-xs text-stone-700 leading-relaxed">{currentQ.prompt}</p>
                    <p className="text-[11px] text-stone-500">本站原创练习，非《经济学人》原文。</p>
                  </div>

                  {!isAnswered ? (
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setShowScaffold(!showScaffold)}
                        className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer"
                        aria-expanded={showScaffold}
                      >
                        {showScaffold ? '收起表达提示' : '需要一点思路？查看表达提示'}
                      </button>
                      {showScaffold && <p className="text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-3">{currentQ.scaffold_hint}</p>}
                      <form onSubmit={handleTranslationSubmit} className="space-y-2.5">
                        <label htmlFor="economist-translation-answer" className="block text-xs font-medium text-stone-700">请写出你的英文译文</label>
                        <textarea
                          id="economist-translation-answer"
                          value={typeInAnswer}
                          onChange={(event) => setTypeInAnswer(event.target.value)}
                          rows={3}
                          placeholder="用英文表达这句论断…"
                          className="w-full p-3.5 bg-white border border-stone-300 rounded-xl text-sm font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-stone-900"
                        />
                        <button type="submit" disabled={!typeInAnswer.trim()} className="w-full py-3 bg-stone-900 hover:bg-black disabled:opacity-40 text-white rounded-xl font-medium text-sm cursor-pointer disabled:cursor-not-allowed">
                          提交并对照参考译文
                        </button>
                      </form>
                      <button type="button" onClick={handleRevealAnswer} className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 border border-dashed border-stone-300 rounded-lg cursor-pointer">
                        暂时想不出？看参考译文
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {typeInAnswer.trim() ? (
                        <div className="p-4 bg-white rounded-xl border border-stone-200 text-sm">
                          <div className="text-[10px] font-mono text-stone-500 mb-1">你的译文</div>
                          <p className="font-serif text-stone-800 whitespace-pre-wrap break-words">{typeInAnswer.trim()}</p>
                        </div>
                      ) : <p className="text-xs text-stone-500">已跳过作答，可直接阅读参考表达。</p>}
                      <div className="p-4 bg-stone-900 text-white rounded-xl text-sm">
                        <div className="text-[10px] font-mono text-stone-300 mb-1">参考译文 · 可有其他合理译法</div>
                        <p className="font-serif leading-relaxed whitespace-pre-wrap select-text">
                          {renderInteractiveSegment(currentQ.reference_translation, true, 'reference')}
                        </p>
                        <p className="text-[10px] text-stone-300 mt-2">点击英文单词查看音标与释义</p>
                      </div>
                      {inspectedWord && inspectedSource !== 'verdict' && renderWordInspector()}
                      <div className="p-4 bg-white rounded-xl border border-[#E5E0D8] space-y-2 text-xs">
                        <div className="font-mono text-[10px] text-stone-500">关键表达</div>
                        {currentQ.key_phrases.map((phrase) => (
                          <div key={phrase.zh} className="flex flex-col sm:flex-row sm:gap-3 border-t border-stone-100 pt-2">
                            <span className="text-stone-600 sm:w-2/5">{phrase.zh}</span>
                            <span className="font-serif text-stone-900 break-words sm:flex-1">{renderInteractiveSegment(phrase.en, false, 'phrase')}</span>
                          </div>
                        ))}
                        <p className="text-stone-700 leading-relaxed border-t border-stone-100 pt-2">{currentQ.analysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- 2. PHYSICAL WORKOUT TASK ---------------- */}
              {(currentQ.category === 'physical' || currentQ.type === 'physical') && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-xs text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 text-stone-800 rounded-full border border-stone-200">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-black text-stone-900">
                        {currentQ.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                        {currentQ.instruction}
                      </p>
                    </div>

                    {/* Minimalist Progress Indicator */}
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80 max-w-sm mx-auto">
                      <div className="flex justify-between text-xs font-mono font-semibold text-stone-700 mb-1.5">
                        <span>进度: {physicalReps} / {currentQ.target_reps} {currentQ.unit}</span>
                        <span>{Math.round((physicalReps / currentQ.target_reps) * 100)}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-stone-900 transition-all duration-300"
                          style={{ width: `${Math.min(100, (physicalReps / currentQ.target_reps) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {!isAnswered ? (
                    <div className="space-y-2.5">
                      {currentQ.mode === 'timer' ? (
                        <div className="space-y-3 text-center">
                          <div className="text-4xl font-mono font-black text-stone-900 py-1">
                            {timerSeconds}s
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setIsTimerRunning(!isTimerRunning)}
                              className="flex-1 py-3.5 bg-stone-900 hover:bg-black text-white font-medium rounded-xl text-sm transition cursor-pointer"
                            >
                              <Play className="w-4 h-4 inline mr-1.5" />
                              <span>{isTimerRunning ? '暂停计时' : `开始 ${currentQ.target_reps || 30} 秒计时`}</span>
                            </button>
                            <button
                              onClick={handleInstantCompletePhysical}
                              className="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-xs transition cursor-pointer"
                            >
                              直接打卡
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={handleRepIncrement}
                            className="w-full py-4 bg-stone-900 hover:bg-black active:scale-[0.99] text-white rounded-xl font-bold text-base transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                          >
                            <Dumbbell className="w-4 h-4 text-stone-300" />
                            <span>完成 1 个 · 计数 (+1)</span>
                            <span className="text-xs bg-stone-800 px-2 py-0.5 rounded font-mono ml-2">
                              剩 {Math.max(0, currentQ.target_reps - physicalReps)}
                            </span>
                          </button>
                          
                          <button
                            onClick={handleInstantCompletePhysical}
                            className="w-full py-2 text-xs text-stone-500 hover:text-stone-900 text-center cursor-pointer transition font-mono"
                          >
                            [ 我已一口气全部做完 · 直接打卡 ]
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}



              {/* ---------------- 4. BREATHING VAGUS TASK ---------------- */}
              {(currentQ.category === 'breathing' || currentQ.type === 'breathing') && (
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-xl border border-[#E5E0D8] shadow-xs text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-100 text-stone-800 rounded-full border border-stone-200">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-black text-stone-900">
                        {currentQ.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto leading-relaxed">
                        第 {breathingCycle} / {currentQ.target_cycles} 轮 · 4秒吸气 → 7秒屏息 → 8秒慢呼
                      </p>
                    </div>

                    <div className="py-4 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-stone-300 bg-stone-50 flex items-center justify-center animate-pulse">
                        <span className="font-serif text-stone-800 text-xs font-bold">
                          深长呼吸中
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {currentQ.phases.map((ph, idx) => (
                        <div key={idx} className="bg-stone-50 border border-stone-200/80 p-2 rounded text-center">
                          <span className="font-bold text-stone-900 block">{ph.name} ({ph.duration}s)</span>
                          <span className="text-[10px] text-stone-500">{ph.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isAnswered && (
                    <button
                      onClick={handleNextBreathingCycle}
                      className="w-full py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-medium text-sm transition cursor-pointer"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      <span>
                        {breathingCycle < currentQ.target_cycles 
                          ? `完成第 ${breathingCycle} 轮 (继续第 ${breathingCycle + 1} 轮)` 
                          : '完成 3 轮镇静呼吸'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* ---------------- 5. THE ECONOMIST CLOZE TASK (WITH TRANSLATION & PHONETICS) ---------------- */}
              {currentQ.type === 'cloze' && (
                <div className="space-y-3.5">
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                    {/* Header with Chinese Translation Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                        THE ECONOMIST PASSAGE
                      </span>

                      {/* Translation Button: Always available on-demand as user-requested clue */}
                      {currentQ.passage_translation && (
                        <button
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="text-[11px] font-sans text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white px-2.5 py-0.5 rounded transition cursor-pointer flex items-center space-x-1"
                          title="点击展开/收起完整中文对照翻译"
                        >
                          <Languages className="w-3 h-3 text-stone-500" />
                          <span>{showTranslation ? '收起译文' : '译 · 中文翻译'}</span>
                        </button>
                      )}
                    </div>

                    {/* Passage with interactive word tap */}
                    {renderPassage(true)}

                    {/* Hint text */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-sans pt-1">
                      <span>💡 点击题干任意单词查看音标与释义</span>
                      {currentQ.type === 'cloze' && (
                        <button
                          onClick={() => { setInputMode(inputMode === 'choice' ? 'type' : 'choice'); setSelectedOption(null); setTypeInAnswer(''); setHasWrongAttempt(false); }}
                          className="text-stone-500 hover:text-black underline cursor-pointer"
                        >
                          {inputMode === 'choice' ? '切换打字模式' : '切换选择题'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Word Inspector Floating Card */}
                  {inspectedWord && inspectedSource !== 'verdict' && renderWordInspector()}

                  {/* Chinese Translation Expanded Card */}
                  {showTranslation && currentQ.passage_translation && (
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-xs text-stone-700 leading-relaxed space-y-1.5 animate-fadeIn">
                      <div className="font-mono text-[10px] text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>CHINESE TRANSLATION · 题干中文对照</span>
                        <span className="text-[10px] text-stone-500 font-sans">中等认知辅助</span>
                      </div>
                      <p className="font-sans text-stone-900 leading-relaxed text-sm">
                        {currentQ.passage_translation}
                      </p>
                    </div>
                  )}

                  {/* Choices or Input */}
                  {!isAnswered ? (
                    <div className="space-y-3">
                      {inputMode === 'choice' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentQ.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(opt)}
                              className={`py-3.5 px-4 border rounded-xl font-serif text-left font-medium transition-colors text-sm shadow-2xs flex items-center justify-between cursor-pointer ${selectedOption === opt && !isCorrect ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-white hover:bg-stone-900 hover:text-white border-[#E5E0D8] hover:border-stone-900 text-stone-900'}`}
                            >
                              <span>{opt}</span>
                              <span className="text-[11px] font-mono text-stone-400">选择</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <form onSubmit={handleTypeSubmit} className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={typeInAnswer}
                              onChange={(e) => setTypeInAnswer(e.target.value)}
                              placeholder={`填入对应单词 (首字母: ${currentQ.first_letter || '?'})...`}
                              className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm font-serif focus:outline-none focus:ring-1 focus:ring-stone-900"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="px-5 py-3 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-sm transition cursor-pointer"
                            >
                              提交
                            </button>
                          </div>
                        </form>
                      )}
                      {hasWrongAttempt && (
                        <p role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                          回答错误，请再试一次；答案暂不显示。
                        </p>
                      )}
                      <button onClick={handleRevealAnswer} className="w-full py-2.5 text-xs text-stone-600 hover:text-stone-900 border border-dashed border-stone-300 rounded-lg cursor-pointer">
                        暂时想不出？点击看正确答案
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {swapButton}

              {isAnswered && isPoetryTask && (
                <div className="flex items-center gap-2 px-1 text-xs text-stone-700">
                  <Check className="w-4 h-4 shrink-0 text-stone-900" aria-hidden="true" />
                  <span>答案已揭晓 · 可对照原文与译文</span>
                </div>
              )}

              {/* ---------------- FEEDBACK & VERDICT (SCHEME A MONOCHROME) ---------------- */}
              {isAnswered && !isPoetryTask && currentQ.category !== 'film_quote' && (
                <div className="space-y-3.5 pt-1">
                  {/* Subtle confirmation line */}
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2 text-xs text-stone-600 px-1">
                    <div className="flex items-start gap-2 shrink-0">
                      <Check className="w-4 h-4 text-stone-900 shrink-0" />
                      <span className="font-medium text-stone-900">
                        {currentQ.mode === 'zh_to_en' || currentQ.type === 'zh_to_en'
                          ? isRevealed ? '参考译文已揭晓 · 已跳过作答' : '参考译文已揭晓 · 请对照表达'
                          : isRevealed
                            ? '答案已揭晓 · 可对照解析'
                            : '回答正确 · 可查看解析'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-stone-300">|</span>
                    <span className="text-stone-500 leading-relaxed break-words min-w-0">{currentQ.science_note || (currentQ.type === 'zh_to_en' ? '开放表达，不按参考译文逐字判分' : '注意占用阻断生效')}</span>
                  </div>

                  {/* Editorial Verdict Box */}
                  <div className="bg-[#18181B] text-white p-4 rounded-xl relative shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono tracking-widest text-stone-400">
                      <span className="text-[#FAFAFA] font-bold">VERDICT · 判词</span>
                      <span className="bg-[#8C1D24] text-white px-1.5 py-0.2">ECONOMIST STYLE</span>
                    </div>
                    <blockquote className="font-serif italic text-sm text-stone-200 leading-relaxed border-l-2 border-[#8C1D24] pl-3 py-0.5">
                      "{renderInteractiveSegment(currentQ.punchline, true, 'verdict')}"
                    </blockquote>
                  </div>
                  {inspectedWord && inspectedSource === 'verdict' && renderWordInspector()}

                  {/* Vocabulary knowledge (if any) */}
                  {currentQ.vocab && (
                    <div className="bg-white p-3.5 rounded-xl border border-[#E5E0D8] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 font-serif font-bold text-stone-900">
                          <span>{currentQ.vocab.word}</span>
                          <span className="font-mono text-stone-400 font-normal text-[11px]">{currentQ.vocab.phonetic}</span>
                        </div>
                        <button
                          onClick={() => onSaveVocab(currentQ)}
                          className="text-[11px] font-mono text-stone-600 hover:text-black flex items-center space-x-1 cursor-pointer"
                        >
                          {isVocabSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isVocabSaved ? '已收藏' : '存入词库'}</span>
                        </button>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{currentQ.vocab.meaning}</p>
                    </div>
                  )}

                </div>
              )}
            </>
            )
          ) : (
            /* Finished State - Editorial Minimalism */
            <div className="text-center py-8 space-y-5">
              <div className="w-12 h-12 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center mx-auto border border-stone-300">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest border border-stone-200 px-2.5 py-0.5 rounded">
                  SESSION COMPLETE
                </span>
                <h3 className="text-2xl font-serif font-black text-stone-900 mt-2">
                  神经冲动已平息
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  在过去的 3 分钟内，通过跨语言意象解密与躯体干预，前额叶工作记忆成功抑制了边缘系统的多巴胺渴求。
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs text-stone-600">
                本次急救练习已计入拦截记录。无烟日申报请在完整挑战日结束后前往主看板。
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-sm transition cursor-pointer"
              >
                返回主看板
              </button>
            </div>
          )}
        </div>
        {showAnsweredAction && currentQ.category !== 'film_quote' && (
          <div data-quiz-continue="bottom" className="shrink-0 border-t border-[#E5E0D8] bg-[#FAF8F5] px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleNext}
              aria-label={`${nextActionLabel}（底部操作）`}
              className="w-full min-h-11 py-3 bg-stone-900 hover:bg-black active:scale-[0.99] text-white rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>{nextActionLabel}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
