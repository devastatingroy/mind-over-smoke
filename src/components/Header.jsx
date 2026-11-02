import React from 'react';
import { ShieldCheck, BookOpen, Wallet } from 'lucide-react';

export default function Header({ state, onOpenVocab, onResetDemo }) {
  const completedCount = state.completedDays.filter(Boolean).length;
  const refundedAmount = completedCount * state.refundPerDay;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E2DFD6] sticky top-0 z-30 shadow-xs">
      {/* Refined Brand Accent Bar */}
      <div className="h-1 bg-[#1A3B2F] w-full" />
      
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#8C1D24] text-white px-2 py-0.5 text-xs font-serif font-black tracking-wider uppercase rounded-xs">
            THE
          </div>
          <div>
            <h1 className="text-lg font-serif font-black tracking-tight text-[#1A1D20] leading-none">
              MindOverSmoke
            </h1>
            <span className="text-[10px] text-gray-500 font-sans tracking-wide">
              智熄 · 理性认知阻断舱
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Vocab book icon */}
          <button
            onClick={onOpenVocab}
            title="认知武器库与反讽语料"
            className="p-1.5 text-gray-600 hover:text-black hover:bg-stone-100 rounded-lg transition relative"
          >
            <BookOpen className="w-5 h-5 text-[#1A3B2F]" />
            {state.savedVocab?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1A3B2F] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {state.savedVocab.length}
              </span>
            )}
          </button>

          {/* Refund Progress Badge */}
          <div className="bg-[#F7F5F0] border border-[#E2DFD6] px-2.5 py-1 rounded-md flex items-center space-x-1.5 text-xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold text-emerald-800">
              已退 ${refundedAmount}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500 font-medium">
              ${state.maxRefund}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
