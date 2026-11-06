import React, { useEffect, useState } from 'react';
import { REFLECTION_ASPECTS, localDayKey, readReflectionState, writeReflectionState } from '../utils/reflection';

export default function ReflectionQuestion({ prompt, compact = false, onSwapAspect, onContinue, onDismiss }) {
  const aspect = REFLECTION_ASPECTS[prompt.aspectIndex];
  const [isWriting, setIsWriting] = useState(false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    const state = readReflectionState();
    const todayNote = state.notes.find((note) => note.day === localDayKey() && note.aspect === aspect);
    setSaved(todayNote?.text || null);
    setDraft(todayNote?.text || '');
    setIsWriting(false);
    setMessage('');
  }, [aspect]);

  const save = () => {
    const text = draft.trim();
    if (!text) {
      setMessage('写下一句后再保存；也可以直接继续。');
      return;
    }
    const day = localDayKey();
    const state = readReflectionState();
    const next = {
      ...state,
      notes: [...state.notes.filter((note) => note.day !== day || note.aspect !== aspect), { day, aspect, text }]
    };
    if (!writeReflectionState(next)) {
      setMessage('保存失败，请检查浏览器存储空间。');
      return;
    }
    setSaved(text);
    setIsWriting(false);
    setMessage('已保存在此浏览器。');
  };

  return (
    <section aria-label="生活的一角" className={compact ? 'bg-[#F5F2EB] border-l-2 border-[#8C1D24] px-3 py-2 space-y-1.5' : 'bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3'}>
      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
        <span className="font-medium text-stone-800">生活的一角 · {aspect}</span>
        {compact && onDismiss && <button type="button" onClick={onDismiss} className="text-stone-600 underline underline-offset-2">收起</button>}
      </div>
      <p className={`font-serif text-stone-900 leading-relaxed ${compact ? 'text-[13px]' : 'text-lg'}`}>
        最近一段，在你能自己安排的时间里，留给{aspect}的时间够用吗？
      </p>
      {!compact && <p className="text-xs text-stone-500">想一想就好，不必回答或打分。</p>}
      <div className={`flex flex-wrap gap-x-5 gap-y-2 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        <button type="button" onClick={onSwapAspect} className="text-stone-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">换一个方面</button>
        <button type="button" onClick={() => setIsWriting((open) => !open)} className="text-stone-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
          {isWriting ? '收起输入' : saved ? '修改今天写的' : '记下一句'}
        </button>
      </div>
      {isWriting && (
        <div className="space-y-2">
          <label className="block text-xs text-stone-600" htmlFor="session-reflection-note">写给自己，最多 280 字</label>
          <textarea id="session-reflection-note" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={280} rows={compact ? 2 : 3} placeholder="想到什么，就记一句。" className="w-full resize-y rounded-lg border border-stone-300 bg-[#FAF8F5] px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-700" />
          <button type="button" onClick={save} className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">保存这一句</button>
        </div>
      )}
      {saved && !isWriting && <p className="text-xs text-stone-600 break-words">今天记下：{saved}</p>}
      {message && <p role="status" className="text-xs text-stone-600">{message}</p>}
      {onContinue && (
        <button type="button" onClick={onContinue} className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
          直接开始刷题
        </button>
      )}
    </section>
  );
}
