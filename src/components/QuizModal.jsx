import React, { useState, useEffect } from 'react';
import { 
  X, 
  Timer, 
  Check, 
  ArrowRight, 
  TrendingDown,
  Coins,
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
import { lookupWord, speakWord, cleanWord } from '../utils/phoneticDict';

export default function QuizModal({ 
  mode, 
  questions, 
  initialIndex = 0,
  initialSecondsLeft = 180,
  onClose, 
  onCompleteSession, 
  isTodayDone,
  onSaveVocab,
  savedVocabIds,
  onSwapTask,
  onProgress
}) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.min(initialIndex, Math.max(0, (questions?.length || 1) - 1)));
  const [selectedOption, setSelectedOption] = useState(null);
  const [typeInAnswer, setTypeInAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [inputMode, setInputMode] = useState('choice'); // 'choice' or 'type'
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft); // 3-minute craving countdown
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Translation & Word Phonetic inspection state
  const [showTranslation, setShowTranslation] = useState(false);
  const [inspectedWord, setInspectedWord] = useState(null);

  // Physical task state
  const [physicalReps, setPhysicalReps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Breathing task state
  const [breathingStep, setBreathingStep] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(1);

  const currentQ = questions[currentIndex] || questions[0];

  // Reset task-specific states when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTypeInAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setIsRevealed(false);
    setPhysicalReps(0);
    setTimerSeconds(currentQ?.target_reps || 30);
    setIsTimerRunning(false);
    setBreathingStep(0);
    setBreathingCycle(1);
    setShowTranslation(false);
    setInspectedWord(null);
  }, [currentIndex, currentQ?.id]);

  // 180s Craving countdown timer
  useEffect(() => {
    if (isSessionFinished) return;
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
  }, [isSessionFinished]);

  // Sync progress back to parent / session storage for seamless reload recovery
  useEffect(() => {
    if (!isSessionFinished && onProgress) {
      onProgress({ currentIndex, secondsLeft });
    }
  }, [currentIndex, secondsLeft, isSessionFinished]);

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
    
    let correct = false;
    if (currentQ.type === 'true_false') {
      correct = (opt === currentQ.correct_boolean);
    } else if (currentQ.category === 'translation' || currentQ.type === 'translation') {
      const correctAns = (currentQ.correct_answer || currentQ.blank || '').toString().trim();
      correct = (opt.toString().trim() === correctAns);
    } else {
      correct = (opt.toString().toLowerCase().trim() === (currentQ.blank || '').toLowerCase().trim());
    }

    setIsCorrect(correct);
    setIsAnswered(true);
  };

  // Handle direct answer reveal (用户点击"看答案")
  const handleRevealAnswer = () => {
    if (isAnswered) return;
    setIsRevealed(true);
    setSelectedOption(currentQ.correct_answer || currentQ.blank);
    setIsCorrect(true);
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
    setIsAnswered(true);
  };

  // Word click to inspect phonetic & definition (严禁自动朗读，仅显示音标与释义)
  const handleWordClick = (rawWord) => {
    const data = lookupWord(rawWord);
    if (!data) return;
    setInspectedWord(data);
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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionFinished(true);
      onCompleteSession();
    }
  };

  const isVocabSaved = currentQ.vocab && savedVocabIds?.includes(currentQ.id);

  // Render clickable interactive words for English passages
  const renderInteractiveSegment = (text) => {
    if (!text) return null;
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, idx) => {
      const cleaned = cleanWord(token);
      if (!cleaned) return <span key={idx}>{token}</span>;
      const isSelected = inspectedWord?.word === cleaned;
      return (
        <span
          key={idx}
          onClick={() => handleWordClick(cleaned)}
          className={`cursor-pointer rounded px-0.5 transition-colors select-text ${
            isSelected 
              ? 'bg-stone-900 text-white font-semibold' 
              : 'hover:bg-stone-200/80 hover:text-stone-900 decoration-stone-300 hover:underline'
          }`}
          title="点击查看音标与释义"
        >
          {token}
        </span>
      );
    });
  };

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
    if (currentQ.category === 'translation' || currentQ.type === 'translation') {
      return {
        code: 'TRANSLATION',
        label: currentQ.mode === 'zh_to_en' ? '汉诗名篇挑选英译' : '英译唐诗逆向还原',
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

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#FAF8F5] text-[#111827] rounded-2xl w-full max-w-xl border border-[#E5E0D8] shadow-xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
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
              {currentIndex + 1}/{questions.length}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* 180s Countdown Badge */}
            <div className="flex items-center space-x-1 text-xs font-mono font-semibold text-stone-800 bg-stone-100 px-2 py-1 rounded shrink-0">
              <Timer className="w-3.5 h-3.5 text-stone-900" />
              <span>{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</span>
            </div>

            {/* Swap Task */}
            {onSwapTask && !isSessionFinished && !isAnswered && (
              <button
                onClick={() => onSwapTask(currentIndex)}
                className="text-[11px] font-sans text-stone-500 hover:text-black border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white px-2 py-1 rounded transition cursor-pointer flex items-center space-x-1 shrink-0 whitespace-nowrap"
                title="更换当前任务"
              >
                <Shuffle className="w-3 h-3 text-stone-400" />
                <span>换题</span>
              </button>
            )}

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
        <div className="bg-[#F5F2EB] px-5 py-2 border-b border-[#E5E0D8]">
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
        </div>

        {/* Modal Main Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isSessionFinished ? (
            <>
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
                            <span>ENGLISH MASTER TRANSLATION</span>
                          </span>
                          <span className="text-stone-300 font-sans">{currentQ.translator}</span>
                        </div>
                        <blockquote className="font-serif italic text-lg sm:text-xl text-stone-100 leading-relaxed border-l-2 border-[#8C1D24] pl-4 py-0.5 select-text">
                          "{renderInteractiveSegment(currentQ.english_text)}"
                        </blockquote>
                        <div className="mt-2 text-[10px] text-stone-400 font-sans flex items-center justify-end">
                          <span>💡 点击英文单词查看音标与释义</span>
                        </div>
                      </div>

                      {/* Classical Reconstruction Context Card (NO Chinese Spoilers!) */}
                      <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                        <div className="text-xs text-stone-500 flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-serif text-stone-800 font-bold text-sm">
                            {currentQ.author} · 《{currentQ.title}》
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
                              古典名作原句全篇
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
                    /* Mode 2: Chinese to English Master Translation Selection */
                    <>
                      {/* Classical Chinese Quote Card */}
                      <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                        <div className="text-xs text-stone-500 flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-serif text-stone-800 font-bold text-sm">
                            {currentQ.author} · 《{currentQ.title}》
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

                      {/* Options or Answered State */}
                      {!isAnswered ? (
                        <div className="space-y-2.5">
                          <div className="space-y-2">
                            {currentQ.options.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectOption(opt)}
                                className="w-full p-4 bg-white hover:bg-stone-900 group border border-[#E5E0D8] hover:border-stone-900 rounded-xl text-left transition-colors shadow-2xs cursor-pointer block"
                              >
                                <div className="flex items-start justify-between">
                                  <p className="font-serif italic text-sm sm:text-base text-stone-800 group-hover:text-white leading-relaxed pr-2">
                                    "{opt}"
                                  </p>
                                  <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-300 shrink-0 mt-0.5">
                                    选择
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Reveal Answer Button */}
                          <button
                            onClick={handleRevealAnswer}
                            className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition text-center cursor-pointer border border-dashed border-stone-300 font-sans flex items-center justify-center space-x-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                            <span>暂时想不出？点击直接【看译本答案与汉学解析】</span>
                          </button>
                        </div>
                      ) : (
                        /* Options shown with selected & correct state */
                        <div className="space-y-2 pt-1">
                          {currentQ.options.map((opt, idx) => {
                            const isCorrectOpt = opt.trim() === currentQ.correct_answer.trim();
                            const isSelected = selectedOption?.trim() === opt.trim();
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-xl border font-serif italic text-sm leading-relaxed ${
                                  isCorrectOpt
                                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                                    : isSelected && !isCorrect
                                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                                      : 'bg-stone-50 text-stone-400 border-stone-200 opacity-60'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <span>"{opt}"</span>
                                  {isCorrectOpt && (
                                    <span className="text-[10px] font-mono not-italic bg-white text-stone-900 px-2 py-0.5 rounded font-bold ml-2 shrink-0">
                                      名家正译
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Word Inspector Floating Card (in case user clicked a word) */}
                  {inspectedWord && (
                    <div className="bg-[#18181B] text-white p-3.5 rounded-xl border border-stone-800 shadow-md flex items-center justify-between animate-fadeIn text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-stone-100 tracking-wide">
                            {inspectedWord.word}
                          </span>
                          {inspectedWord.phonetic && (
                            <span className="font-mono text-emerald-400 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              {inspectedWord.phonetic}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 text-[11px] font-sans">
                          {inspectedWord.pos && <span className="text-stone-400 italic mr-1">{inspectedWord.pos}</span>}
                          {inspectedWord.def}
                        </p>
                      </div>

                      <button
                        onClick={() => setInspectedWord(null)}
                        className="text-stone-400 hover:text-white p-1 ml-2 cursor-pointer"
                        title="关闭"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Bilingual Mapping Table when answered */}
                  {isAnswered && currentQ.mapping && (
                    <div className="bg-white p-4.5 rounded-xl border border-[#E5E0D8] text-xs space-y-2.5">
                      <div className="font-mono text-[10px] text-stone-500 uppercase tracking-wider flex items-center justify-between">
                        <span>BILINGUAL SEMANTIC MAPPING · 意象转码对照</span>
                        <span className="font-sans text-[10px] text-stone-400">词意精准咬合</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentQ.mapping.map((m, idx) => (
                          <div key={idx} className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80 flex items-center justify-between text-xs">
                            <span className="font-serif italic text-stone-700 truncate mr-1.5">{m.en}</span>
                            <span className="text-stone-400 font-mono text-xs shrink-0">⇄</span>
                            <span className="font-bold text-stone-900 ml-1.5 shrink-0">{m.zh}</span>
                          </div>
                        ))}
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
              {(currentQ.category === 'economist' || currentQ.type === 'cloze' || currentQ.type === 'true_false') && (
                <div className="space-y-3.5">
                  <div className="bg-white p-5 rounded-xl border border-[#E5E0D8] shadow-xs space-y-3">
                    {/* Header with Chinese Translation Toggle */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                        THE ECONOMIST PASSAGE
                      </span>

                      {/* Translation Button: Only unlocked after answering to prevent leakage */}
                      {currentQ.passage_translation && (
                        isAnswered ? (
                          <button
                            onClick={() => setShowTranslation(!showTranslation)}
                            className="text-[11px] font-sans text-stone-600 hover:text-stone-900 border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white px-2.5 py-0.5 rounded transition cursor-pointer flex items-center space-x-1"
                            title="点击展开/收起完整中文对照翻译"
                          >
                            <Languages className="w-3 h-3 text-stone-500" />
                            <span>{showTranslation ? '收起译文' : '译 · 中文翻译'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-sans text-stone-400 flex items-center space-x-1" title="完成作答后解锁中文对照翻译">
                            <Languages className="w-3 h-3 text-stone-300" />
                            <span>作答后解锁译文</span>
                          </span>
                        )
                      )}
                    </div>

                    {currentQ.type === 'true_false' && (
                      <div className="mb-2 text-xs font-serif italic text-stone-600 border-l-2 border-stone-900 pl-2.5">
                        {currentQ.statement}
                      </div>
                    )}

                    {/* Passage with interactive word tap */}
                    {renderPassage(true)}

                    {/* Hint text */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-sans pt-1">
                      <span>💡 点击题干任意单词查看音标与释义</span>
                      {currentQ.type === 'cloze' && (
                        <button
                          onClick={() => setInputMode(inputMode === 'choice' ? 'type' : 'choice')}
                          className="text-stone-500 hover:text-black underline cursor-pointer"
                        >
                          {inputMode === 'choice' ? '切换打字模式' : '切换选择题'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Word Inspector Floating Card */}
                  {inspectedWord && (
                    <div className="bg-[#18181B] text-white p-3.5 rounded-xl border border-stone-800 shadow-md flex items-center justify-between animate-fadeIn text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-stone-100 tracking-wide">
                            {inspectedWord.word}
                          </span>
                          {inspectedWord.phonetic && (
                            <span className="font-mono text-emerald-400 text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                              {inspectedWord.phonetic}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 text-[11px] font-sans">
                          {inspectedWord.pos && <span className="text-stone-400 italic mr-1">{inspectedWord.pos}</span>}
                          {inspectedWord.def}
                        </p>
                      </div>

                      <button
                        onClick={() => setInspectedWord(null)}
                        className="text-stone-400 hover:text-white p-1 ml-2 cursor-pointer"
                        title="关闭"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

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
                      {currentQ.statement_translation && (
                        <p className="font-sans text-stone-600 border-t border-stone-200/60 pt-2 text-xs italic">
                          判断题干：{currentQ.statement_translation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Choices or Input */}
                  {!isAnswered ? (
                    <div className="space-y-3">
                      {currentQ.type === 'true_false' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleSelectOption(true)}
                            className="py-3.5 px-4 bg-white hover:bg-stone-900 hover:text-white border border-[#E5E0D8] hover:border-stone-900 rounded-xl font-bold text-stone-800 transition-colors text-sm cursor-pointer"
                          >
                            True (真实有效)
                          </button>
                          <button
                            onClick={() => handleSelectOption(false)}
                            className="py-3.5 px-4 bg-white hover:bg-stone-900 hover:text-white border border-[#E5E0D8] hover:border-stone-900 rounded-xl font-bold text-stone-800 transition-colors text-sm cursor-pointer"
                          >
                            False (伪概念/谎言)
                          </button>
                        </div>
                      ) : inputMode === 'choice' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {currentQ.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(opt)}
                              className="py-3.5 px-4 bg-white hover:bg-stone-900 hover:text-white border border-[#E5E0D8] hover:border-stone-900 rounded-xl font-serif text-left font-medium text-stone-900 transition-colors text-sm shadow-2xs flex items-center justify-between cursor-pointer"
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
                    </div>
                  ) : null}
                </div>
              )}

              {/* ---------------- FEEDBACK & VERDICT (SCHEME A MONOCHROME) ---------------- */}
              {isAnswered && (
                <div className="space-y-3.5 pt-1">
                  {/* Subtle confirmation line */}
                  <div className="flex items-center space-x-2 text-xs text-stone-600 px-1">
                    <Check className="w-4 h-4 text-stone-900" />
                    <span className="font-medium text-stone-900">
                      {isRevealed
                        ? '原篇揭晓 · 强化双向意象记忆'
                        : isCorrect 
                          ? '前额叶认知已成功接管' 
                          : `标准答案: ${currentQ.correct_answer || currentQ.blank}`}
                    </span>
                    <span className="text-stone-300">|</span>
                    <span className="text-stone-500 truncate">{currentQ.science_note || '注意占用阻断生效'}</span>
                  </div>

                  {/* Editorial Verdict Box */}
                  <div className="bg-[#18181B] text-white p-4.5 rounded-xl relative shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono tracking-widest text-stone-400">
                      <span className="text-[#FAFAFA] font-bold">VERDICT · 判词</span>
                      <span className="bg-[#8C1D24] text-white px-1.5 py-0.2">ECONOMIST STYLE</span>
                    </div>
                    <blockquote className="font-serif italic text-sm text-stone-200 leading-relaxed border-l-2 border-[#8C1D24] pl-3 py-0.5">
                      "{currentQ.punchline}"
                    </blockquote>
                  </div>

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

                  {/* Next Step Action Button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-stone-900 hover:bg-black active:scale-[0.99] text-white rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <span>{currentIndex < questions.length - 1 ? '继续下一项阻断' : '完成本次急救'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
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

              {!isTodayDone ? (
                <div className="bg-[#18181B] text-white p-4 rounded-xl text-left border border-stone-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5 text-stone-200" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-stone-400 tracking-wider">CONTRACT FULFILLED</div>
                      <div className="text-base font-serif font-bold text-white">今日已成功履约返还 $1.00</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs text-stone-600">
                  今日返还额度早前已解锁，本次练习已累积记录入总拦截日志。
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-sm transition cursor-pointer"
              >
                返回主看板
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
