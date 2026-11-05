import React from 'react';
import { ShieldCheck, BookOpen, Wallet } from 'lucide-react';

export default function Header({ state, onOpenVocab, onResetDemo }) {
  const completedCount = state.completedDays.filter(Boolean).length;
  const refundedAmount = completedCount * state.refundPerDay;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] sticky top-0 z-30 shadow-2xs">
      {/* Editorial Accent Bar */}
      <div className="h-0.5 bg-[#8C1D24] w-full" />
      
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="bg-[#8C1D24] text-white px-1.5 py-0.5 text-[11px] font-serif font-black tracking-widest uppercase shrink-0">
            THE
          </div>
          <div className="min-w-0">
            <h1 className="text-sm min-[360px]:text-base sm:text-lg font-serif font-black tracking-tight text-stone-900 leading-none truncate">
              MindOverSmoke
            </h1>
            <span className="block truncate text-[10px] text-stone-500 font-mono tracking-wide">
              智熄 · 理性认知阻断
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Vocab book icon */}
          <button
            onClick={onOpenVocab}
            title="认知武器库与词汇"
            className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded-lg transition relative cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-stone-800" />
            {state.savedVocab?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                {state.savedVocab.length}
              </span>
            )}
          </button>

          {/* Refund Progress Badge */}
          <div className="bg-stone-50 border border-[#E5E0D8] px-2 min-[360px]:px-2.5 py-1 rounded-md flex items-center space-x-1.5 text-xs font-mono whitespace-nowrap shrink-0">
            <Wallet className="hidden min-[360px]:block w-3.5 h-3.5 text-stone-700 shrink-0" />
            <span className="font-semibold text-stone-900">
              ${refundedAmount}
            </span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-500 font-normal">
              ${state.maxRefund}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
