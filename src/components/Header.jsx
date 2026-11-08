import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Header({ state, onOpenVocab }) {
  return (
    <header className="border-b border-[#E5E0D8] bg-white">
      <div className="h-0.5 bg-[#8C1D24]" />
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold tracking-tight text-stone-900">MindOverSmoke</h1>
          <p className="text-[11px] text-stone-500">智熄</p>
        </div>
        <button
          type="button"
          onClick={onOpenVocab}
          aria-label={`打开词库${state.savedVocab?.length ? `，已收藏 ${state.savedVocab.length} 项` : ''}`}
          className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          词库
        </button>
      </div>
    </header>
  );
}
