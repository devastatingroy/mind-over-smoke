import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SosPanicButton({ onStartQuiz }) {
  return (
    <section className="rounded-2xl border border-[#E5E0D8] bg-white px-6 py-8 sm:px-8 sm:py-10">
      <p className="text-[11px] font-medium tracking-[0.2em] text-[#8C1D24]">MIND OVER SMOKE</p>
      <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[34px]">
        此刻想抽烟？
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">先用三分钟，做三件别的事。</p>

      <button
        type="button"
        onClick={() => onStartQuiz('sos')}
        className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3.5 text-base font-semibold text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        开始 3 分钟急救
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onStartQuiz('practice')}
        className="mx-auto mt-5 block text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        日常精读 · 5 项
      </button>
    </section>
  );
}
