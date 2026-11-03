import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Timer, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  TrendingDown,
  Coins
} from 'lucide-react';

export default function QuizModal({ 
  mode, 
  questions, 
  onClose, 
  onCompleteSession, 
  isTodayDone,
  onSaveVocab,
  savedVocabIds 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [typeInAnswer, setTypeInAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [inputMode, setInputMode] = useState('choice'); // 'choice' or 'type'
  const [secondsLeft, setSecondsLeft] = useState(180); // 3-minute craving countdown
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  // 180s countdown timer
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

  // Craving wave stage text - Calming & Non-alarming
  const getCravingStage = () => {
    if (secondsLeft > 120) {
      return {
        text: '冲动浪涌高发期 (Peak Wave)',
        desc: '神经回路正在索取刺激，专注思考正在抢占工作记忆！',
        color: 'text-stone-700 bg-stone-100 border-stone-300'
      };
    } else if (secondsLeft > 50) {
      return {
        text: '生理阻断消退期 (Subsiding Wave)',
        desc: '前额叶认知已成功占满注意力，生理渴求已显著减弱。',
        color: 'text-teal-800 bg-teal-50 border-teal-200'
      };
    } else {
      return {
        text: '安全受控区 (Neutralized)',
        desc: '神经递质渴望已回落至基线，你已夺回自控权。',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-300'
      };
    }
  };

  const stage = getCravingStage();

  // Handle option select
  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    
    let correct = false;
    if (currentQ.type === 'true_false') {
      correct = (opt === currentQ.correct_boolean);
    } else {
      correct = (opt.toLowerCase().trim() === currentQ.blank.toLowerCase().trim());
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 }
      });
    }
  };

  // Handle typing submit
  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (!typeInAnswer.trim() || isAnswered) return;
    const correct = typeInAnswer.toLowerCase().trim() === currentQ.blank.toLowerCase().trim();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  // Next question or finish
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTypeInAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsSessionFinished(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onCompleteSession();
    }
  };

  const isVocabSaved = currentQ.vocab && savedVocabIds.includes(currentQ.id);

  // Render text with blank
  const renderPassage = () => {
    const parts = currentQ.passage.split('________');
    return (
      <p className="font-serif text-lg leading-relaxed text-[#1A1D20] tracking-normal">
        {parts[0]}
        <span className={`inline-block px-2.5 py-0.5 mx-1 font-bold rounded border ${
          isAnswered 
            ? (isCorrect ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-stone-200 text-stone-800 border-stone-400')
            : 'bg-emerald-50/70 text-emerald-950 border-emerald-300 border-dashed animate-pulse'
        }`}>
          {isAnswered ? currentQ.blank : `[ ? ${currentQ.hint ? '· ' + currentQ.hint.slice(0, 24) + '...' : ''} ]`}
        </span>
        {parts[1]}
      </p>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#F7F5F0] rounded-2xl w-full max-w-xl border border-[#E2DFD6] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header: Brand & Progress */}
        <div className="bg-white border-b border-[#E2DFD6] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#1A3B2F] text-white text-[10px] font-serif font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
              {mode === 'sos' ? 'SOS 认知阻断中' : '日常精读'}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              第 {currentIndex + 1} / {questions.length} 题
            </span>
            <span className="text-[10px] text-gray-400 border border-stone-200 px-1.5 py-0.5 rounded">
              池化 36 题随机
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Craving Timer */}
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-gray-700 bg-stone-100 px-2 py-1 rounded-md">
              <Timer className="w-3.5 h-3.5 text-[#1A3B2F]" />
              <span>{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 180s Craving Biological Wave Bar - Soothing Gradient */}
        <div className="bg-stone-50 px-4 py-2 border-b border-[#E2DFD6]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center space-x-1 font-semibold text-stone-700">
              <TrendingDown className="w-3 h-3 text-[#1A3B2F]" />
              <span>冲动退潮曲线 (Craving Wave)</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${stage.color}`}>
              {stage.text}
            </span>
          </div>
          {/* Progress track */}
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#183654] via-[#2A5745] to-[#10B981] transition-all duration-1000"
              style={{ width: `${Math.max(5, (secondsLeft / 180) * 100)}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!isSessionFinished ? (
            <>
              {/* Question Theme Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#183654] uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  {currentQ.theme}
                </span>
                {currentQ.type === 'cloze' && (
                  <button
                    onClick={() => setInputMode(inputMode === 'choice' ? 'type' : 'choice')}
                    className="text-[11px] text-gray-500 hover:text-black underline cursor-pointer"
                  >
                    切换至{inputMode === 'choice' ? '键盘手打输入' : '选择题模式'}
                  </button>
                )}
              </div>

              {/* Passage Card */}
              <div className="bg-white p-5 rounded-xl border border-[#E2DFD6] shadow-xs">
                {currentQ.type === 'true_false' && (
                  <div className="mb-3 text-xs font-serif italic text-gray-500 border-l-2 border-[#1A3B2F] pl-2.5">
                    {currentQ.statement}
                  </div>
                )}
                {renderPassage()}
              </div>

              {/* Interaction Area */}
              {!isAnswered ? (
                <div className="space-y-3">
                  {currentQ.type === 'true_false' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleSelectOption(true)}
                        className="py-3 px-4 bg-white hover:bg-emerald-50 active:bg-emerald-100 border-2 border-stone-200 hover:border-emerald-600 rounded-xl font-bold text-gray-800 transition text-sm flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>True (真实有效)</span>
                      </button>
                      <button
                        onClick={() => handleSelectOption(false)}
                        className="py-3 px-4 bg-white hover:bg-stone-100 active:bg-stone-200 border-2 border-stone-200 hover:border-stone-500 rounded-xl font-bold text-gray-800 transition text-sm flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>False (伪概念/谎言)</span>
                      </button>
                    </div>
                  ) : inputMode === 'choice' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentQ.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSelectOption(opt)}
                          className="py-3 px-4 bg-white hover:bg-emerald-50/50 hover:border-[#1A3B2F] active:scale-[0.99] border border-stone-300 rounded-xl font-serif text-left font-medium text-[#1A1D20] transition text-sm shadow-xs flex items-center justify-between group cursor-pointer"
                        >
                          <span>{opt}</span>
                          <span className="text-stone-400 group-hover:text-[#1A3B2F] text-xs font-sans">
                            选择
                          </span>
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
                          className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm font-serif focus:outline-none focus:ring-2 focus:ring-[#1A3B2F]"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 bg-[#1A3B2F] hover:bg-[#132C23] text-white font-bold rounded-xl text-sm transition cursor-pointer"
                        >
                          提交
                        </button>
                      </div>
                      {currentQ.hint && (
                        <p className="text-[11px] text-gray-500 italic">
                          💡 词义线索: {currentQ.hint}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              ) : (
                /* Feedback & Punchline Card */
                <div className="space-y-4 fade-in">
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    isCorrect 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                      : 'bg-stone-100 border-stone-300 text-stone-900'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-stone-600 mt-0.5 shrink-0" />
                    )}
                    <div className="text-sm">
                      <p className="font-bold">
                        {isCorrect ? '前额叶成功接管！注意力已移开' : `正确答案是: ${currentQ.blank}`}
                      </p>
                      <p className="text-xs mt-0.5 opacity-90">
                        深度认知解码已切断边缘系统对多巴胺的即刻渴求。
                      </p>
                    </div>
                  </div>

                  {/* The Economist Satirical Punchline */}
                  <div className="bg-[#0F172A] text-white p-4 rounded-xl relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-[#8C1D24] text-white text-[9px] font-serif font-bold px-2 py-0.5 uppercase tracking-widest">
                      THE ECONOMIST VERDICT
                    </div>
                    <div className="text-xs text-emerald-400 font-serif font-bold uppercase tracking-wider mb-1">
                      辛辣毒舌点评
                    </div>
                    <blockquote className="font-serif italic text-sm text-gray-200 leading-relaxed">
                      "{currentQ.punchline}"
                    </blockquote>
                  </div>

                  {/* Vocabulary & Cognitive Knowledge Card */}
                  {currentQ.vocab && (
                    <div className="bg-white p-4 rounded-xl border border-[#E2DFD6] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-gray-900">
                            {currentQ.vocab.word}
                          </span>
                          <span className="font-mono text-gray-500 text-xs">
                            {currentQ.vocab.phonetic}
                          </span>
                        </div>
                        <button
                          onClick={() => onSaveVocab(currentQ)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                            isVocabSaved 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-stone-100 hover:bg-stone-200 text-gray-700'
                          }`}
                        >
                          {isVocabSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isVocabSaved ? '已收藏' : '存入武器库'}</span>
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-sans">
                        {currentQ.vocab.meaning}
                      </p>
                    </div>
                  )}

                  {/* Next Question / Finish Action */}
                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 px-4 bg-[#1A3B2F] hover:bg-[#132C23] active:scale-[0.99] text-white rounded-xl font-bold text-sm tracking-wide shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>{currentIndex < questions.length - 1 ? '继续下一题阻断' : '完成本次认知阻断'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Session Finished Celebration View */
            <div className="text-center py-6 space-y-5 fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                  CRAVING WAVE NEUTRALIZED
                </span>
                <h3 className="text-2xl font-serif font-black text-gray-900 mt-2">
                  神经冲动已被平息！
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  你刚刚成功完成了 3 道高认知英语题。在过去的 3 分钟里，急性渴求波峰已平息，你的大脑重新回到了自主掌控状态。
                </p>
              </div>

              {/* Unlock $1 Reward Banner if today was not done */}
              {!isTodayDone ? (
                <div className="bg-[#1A3B2F] text-white p-4 rounded-2xl shadow-md text-left relative overflow-hidden">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <Coins className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                        契约履约奖励达成
                      </div>
                      <div className="text-lg font-serif font-bold mt-0.5">
                        恭喜！今日已成功返还 $1.00
                      </div>
                      <div className="text-xs text-emerald-100/80 mt-0.5">
                        资金已计入返还池，坚守承诺即可在到期时全额提取。
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-100 p-4 rounded-xl text-xs text-gray-600">
                  今日额度已在早前解锁，本次练习已计入总拦截次数与机能逆转统计。
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#1A3B2F] hover:bg-[#132C23] text-white font-bold rounded-xl text-sm transition cursor-pointer"
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
