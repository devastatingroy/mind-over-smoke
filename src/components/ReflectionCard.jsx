import React, { useEffect, useState } from 'react';
import {
  REFLECTION_ASPECTS,
  defaultAspectIndex,
  localDayKey,
  readReflectionState,
  writeReflectionState
} from '../utils/reflection';

export default function ReflectionCard() {
  const [today, setToday] = useState(() => localDayKey());
  const [reflection, setReflection] = useState(readReflectionState);
  const [isWriting, setIsWriting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const refreshDay = () => setToday(localDayKey());
    const timer = window.setInterval(refreshDay, 60_000);
    document.addEventListener('visibilitychange', refreshDay);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshDay);
    };
  }, []);

  const aspectIndex = reflection.selectedDay === today && reflection.selectedAspect !== null
    ? reflection.selectedAspect
    : defaultAspectIndex(today);
  const aspect = REFLECTION_ASPECTS[aspectIndex];
  const notes = [...reflection.notes].sort((a, b) => b.day.localeCompare(a.day));
  const latestForAspect = notes.find((note) => note.aspect === aspect);
  const todayNote = notes.find((note) => note.day === today && note.aspect === aspect);

  const switchAspect = () => {
    const next = {
      ...reflection,
      selectedDay: today,
      selectedAspect: (aspectIndex + 1) % REFLECTION_ASPECTS.length
    };
    setReflection(next);
    writeReflectionState(next);
    setIsWriting(false);
    setDraft('');
    setMessage('');
  };

  const openEditor = () => {
    setDraft(todayNote?.text || '');
    setIsWriting(true);
    setMessage('');
  };

  const saveNote = () => {
    const text = draft.trim();
    if (!text) {
      setMessage('写下一句后再保存；也可以直接收起。');
      return;
    }
    const next = {
      ...reflection,
      notes: [
        ...reflection.notes.filter((note) => note.day !== today || note.aspect !== aspect),
        { day: today, aspect, text }
      ]
    };
    if (!writeReflectionState(next)) {
      setMessage('保存失败，请检查浏览器存储空间。');
      return;
    }
    setReflection(next);
    setIsWriting(false);
    setMessage('已保存在此浏览器。');
  };

  const deleteNote = (day, noteAspect) => {
    if (!window.confirm('删除这条记录？')) return;
    const next = {
      ...reflection,
      notes: reflection.notes.filter((note) => note.day !== day || note.aspect !== noteAspect)
    };
    if (!writeReflectionState(next)) {
      setMessage('删除失败，请检查浏览器存储空间。');
      return;
    }
    setReflection(next);
    if (day === today && noteAspect === aspect) {
      setIsWriting(false);
      setDraft('');
    }
    setMessage('记录已删除。');
  };

  return (
    <section aria-labelledby="reflection-title" className="bg-white border border-[#E5E0D8] rounded-xl px-5 py-5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 id="reflection-title" className="font-serif text-lg font-bold text-stone-900">生活的一角</h2>
        <span className="text-xs text-stone-500">{aspect}</span>
      </div>

      <p className="font-serif text-[17px] leading-relaxed text-stone-900">
        最近一段，在你能自己安排的时间里，留给{aspect}的时间够用吗？
      </p>
      <p className="text-xs text-stone-500 mt-2">想一想就好，不必写下来。</p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm">
        <button type="button" onClick={switchAspect} className="text-stone-700 hover:text-stone-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
          换一个方面
        </button>
        <button type="button" onClick={isWriting ? () => setIsWriting(false) : openEditor} className="text-stone-700 hover:text-stone-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
          {isWriting ? '收起输入' : todayNote ? '修改今天写的' : '记下一句'}
        </button>
      </div>

      {isWriting && (
        <div className="mt-4 border-t border-stone-200 pt-4 space-y-2">
          <label htmlFor="reflection-note" className="block text-xs text-stone-600">写给自己，最多 280 字</label>
          <textarea
            id="reflection-note"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={280}
            rows={3}
            placeholder="想到什么，就记一句。"
            className="w-full resize-y rounded-lg border border-stone-300 bg-[#FAF8F5] px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-700"
          />
          <button type="button" onClick={saveNote} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
            保存这一句
          </button>
        </div>
      )}

      {latestForAspect && !isWriting && (
        <p className="mt-4 border-t border-stone-100 pt-3 text-xs leading-relaxed text-stone-600 break-words">
          {latestForAspect.day === today ? '今天记下' : '最近记下'}（{latestForAspect.day}）：{latestForAspect.text}
        </p>
      )}

      {message && <p role="status" className="mt-3 text-xs text-stone-700">{message}</p>}

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <span>文字只保存在当前浏览器；清除浏览器数据后无法恢复。</span>
        {notes.length > 0 && (
          <button type="button" onClick={() => setShowHistory(!showHistory)} className="text-stone-700 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
            {showHistory ? '收起记录' : `回看记录（${notes.length}）`}
          </button>
        )}
      </div>

      {showHistory && notes.length > 0 && (
        <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-stone-100 border-t border-stone-100">
          {notes.map((note) => (
            <li key={`${note.day}-${note.aspect}`} className="py-3 text-xs text-stone-700">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-stone-600">{note.day} · {note.aspect}</span>
                <button type="button" onClick={() => deleteNote(note.day, note.aspect)} className="text-stone-500 hover:text-[#8C1D24] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">
                  删除
                </button>
              </div>
              <p className="mt-1 break-words whitespace-pre-wrap leading-relaxed">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
