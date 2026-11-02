import React from 'react';
import { Brain, ArrowRight, Zap, CheckCircle2, Shield } from 'lucide-react';

export default function SosPanicButton({ onStartQuiz, isTodayDone, streak }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1A3B2F] uppercase tracking-wider">
          <Shield className="w-4 h-4 text-[#1A3B2F]" />
          <span>Cognitive Crave Shield · 前额叶注意占用</span>
        </div>
        {isTodayDone ? (
          <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>今日 $1 已解锁</span>
          </span>
        ) : (
          <span className="text-xs text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200 font-medium">
            今日待返 $1.00
          </span>
        )}
      </div>

      <div className="text-center my-4">
        <h2 className="text-xl font-serif font-black text-[#1A1D20] tracking-tight mb-2">
          烟瘾突发？把控制权交还前额叶
        </h2>
        <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
          急性冲动在 <span className="font-bold text-[#1A3B2F]">180 秒</span> 内达到生理峰值后必然自然回落。
          深吸一口气，通过英式反讽与完形填空，用专注思考平息交感神经躁动。
        </p>
      </div>

      {/* Main Calming Sanctuary Button */}
      <div className="my-5 flex flex-col items-center">
        <button
          onClick={() => onStartQuiz('sos')}
          className="animate-calm-pulse relative group w-full py-4 px-6 bg-[#1A3B2F] hover:bg-[#132C23] active:scale-[0.98] text-white rounded-xl font-serif font-bold text-lg tracking-wide shadow-lg shadow-emerald-950/20 transition-all duration-300 flex items-center justify-center space-x-3 cursor-pointer"
        >
          <Brain className="w-6 h-6 text-emerald-300" />
          <span>深呼吸 · 启动 3 分钟阻断答题</span>
          <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[11px] text-gray-400 mt-2.5 flex items-center space-x-1">
          <Zap className="w-3 h-3 text-emerald-600" />
          <span>0 延迟秒开 · 3道《经济学人》犀利填空题 · 离线可用</span>
        </p>
      </div>

      {/* Secondary Button */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-gray-500">
        <span>当前无冲动，仅想强化认知？</span>
        <button
          onClick={() => onStartQuiz('practice')}
          className="text-[#183654] hover:text-[#1A3B2F] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <span>日常精读刷题</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
