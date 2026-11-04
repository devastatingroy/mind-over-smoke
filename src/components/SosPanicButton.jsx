import React from 'react';
import { ArrowRight, Zap, Shield, Dumbbell, Scroll, Languages } from 'lucide-react';
import { taskStats } from '../utils/taskManager';

export default function SosPanicButton({ onStartQuiz, isTodayDone, streak }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6 shadow-xs">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-stone-500 uppercase">
          <Shield className="w-3.5 h-3.5 text-stone-900" />
          <span>COGNITIVE CRAVE SHIELD</span>
        </div>
        {isTodayDone ? (
          <span className="text-[11px] font-mono text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200">
            今日已履约返还 $1.00
          </span>
        ) : (
          <span className="text-[11px] font-mono text-stone-500 border border-stone-200 px-2 py-0.5 rounded">
            今日待返 $1.00
          </span>
        )}
      </div>

      {/* Editorial Headline & Brief */}
      <div className="text-center my-3">
        <h2 className="text-2xl font-serif font-black text-stone-900 tracking-tight mb-2">
          烟瘾突发？把控制权交还前额叶
        </h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed font-sans">
          生理研究表明，急性尼古丁渴求在 <span className="font-semibold text-stone-900">180 秒</span> 内冲顶后必然自然回落。
          已备妥 <span className="font-medium text-stone-900">英译唐诗解密</span>、<span className="font-medium text-stone-900">10个俯卧撑/平板</span> 与 <span className="font-medium text-stone-900">经济学人题库</span>，零延迟秒级接管注意力。
        </p>
      </div>

      {/* Main Single-Tone Sanctuary Action */}
      <div className="my-5 flex flex-col items-center">
        <button
          onClick={() => onStartQuiz('sos')}
          className="w-full py-4 px-6 bg-stone-900 hover:bg-black active:scale-[0.99] text-white rounded-xl font-serif font-bold text-lg tracking-wide transition-colors shadow-sm flex items-center justify-center space-x-2.5 cursor-pointer"
        >
          <span>启动 3 分钟急救干预</span>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Clean Monochrome Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-[11px] font-mono text-stone-500">
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-stone-200 bg-stone-50">
            <Zap className="w-3 h-3 text-stone-700" />
            <span>APP 图标直达</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-stone-200 bg-stone-50">
            <Languages className="w-3 h-3 text-stone-700" />
            <span>英译唐诗解密</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-stone-200 bg-stone-50">
            <Dumbbell className="w-3 h-3 text-stone-700" />
            <span>10个俯卧撑/平板</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-stone-200 bg-stone-50">
            <Scroll className="w-3 h-3 text-stone-700" />
            <span>唐诗心流</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded border border-stone-200 text-stone-400">
            <span>池化 {taskStats.total} 项</span>
          </span>
        </div>
      </div>

      {/* Secondary Action */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>当前无冲动，仅想强化认知？</span>
        <button
          onClick={() => onStartQuiz('practice')}
          className="text-stone-900 hover:underline font-semibold flex items-center space-x-1 cursor-pointer font-sans"
        >
          <span>日常精读刷题 (5题)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
