import React, { useState } from 'react';
import { CheckCircle2, CircleDot, HelpCircle, Lock } from 'lucide-react';

const statusText = {
  upcoming: '待开始',
  active: '进行中',
  reportable: '待申报',
  smoke_free: '无烟 · +$1',
  smoked: '吸烟 · $0',
  expired: '逾期 · $0'
};

export default function ContractDashboard({ state, view, onStart, onReport }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [confirmDay, setConfirmDay] = useState(null);
  const next = view?.nextReport;

  const submit = (result) => {
    if (!next || confirmDay !== next.number) return;
    onReport(next.number, result);
    setConfirmDay(null);
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-sm space-y-5" aria-label="14 天无烟挑战">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
        当前为免费体验：没有收取 $20，也不会产生真实的 $1 退款。下方金额仅演示正式计划的计算规则。
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="bg-[#8C1D24] text-white text-[10px] font-serif font-black px-1.5 py-0.5 uppercase tracking-wider">14-DAY CHALLENGE</span>
          <h3 className="text-base font-serif font-black text-gray-900 mt-1">14 天无烟挑战</h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">正式规则：支付 $20 计划费用；每个自报无烟日返 $1，最多 $14。自报不等于客观核验。</p>
        </div>
        <button onClick={() => setShowExplanation(!showExplanation)} className="text-gray-500 hover:text-gray-800 p-1 cursor-pointer" aria-label="查看挑战规则" aria-expanded={showExplanation}>
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {showExplanation && (
        <div className="bg-[#F7F5F0] border border-[#E2DFD6] p-3.5 rounded-xl text-xs text-gray-700 leading-relaxed space-y-2">
          <p>每天结束后，在接下来的两个自然日内申报该日是否吸过烟。只要吸过一口卷烟，该日就不能申报无烟。SOS 和练习不影响申报资格。</p>
          <p>正式计划中，无烟日的 $1 将申请原路退款；抽烟或逾期未报的日子不退款，也不影响之后的日子。未返金额由平台保留，因此平台收入可能高于全胜时的 $6 毛收入。</p>
          <p>电子烟及其他产品的计入规则、支付渠道和商户地区须在正式收费前明确。当前体验记录只保存在此浏览器，不是付款或退款凭据。</p>
        </div>
      )}

      {!view ? (
        <div className="bg-[#F7F5F0] border border-[#E2DFD6] p-4 rounded-xl text-center space-y-3">
          <p className="text-sm text-gray-800">开始后，明天为第 1 个完整挑战日；后天起可申报第 1 天。</p>
          <button onClick={onStart} className="px-4 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-black cursor-pointer">开始免费体验</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 bg-[#F7F5F0] border border-[#E2DFD6] p-3 rounded-xl text-center">
            <div><div className="text-[10px] text-gray-500">正式计划费</div><div className="text-sm font-black font-serif">$20</div></div>
            <div className="border-x border-stone-200"><div className="text-[10px] text-gray-500">模拟符合返款</div><div className="text-sm font-black font-serif text-emerald-800">${view.smokeFreeCount}</div></div>
            <div><div className="text-[10px] text-gray-500">已申报天数</div><div className="text-sm font-black font-serif">{view.reportedCount}/14</div></div>
          </div>

          {view.currentDay === 0 && <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">准备日 · 第 1 天将于 {view.days[0].date} 00:00 开始（{state.challenge.timeZone}）。今天尚无可申报的完整挑战日。</p>}
          {view.currentDay > 0 && !next && <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">目前没有待申报的完整挑战日。当天结束后才可申报，已申报的日期不会重复提交。</p>}
          {next && (
            <div className="rounded-xl border border-[#E2DFD6] p-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-stone-900">第 {next.number} 天（{next.date}），你有没有吸过任何一口卷烟？</p>
                <p className="text-xs text-stone-500 mt-1">请如实自报 · 截止 {next.deadline} 23:59（{state.challenge.timeZone}）</p>
              </div>
              {confirmDay === next.number ? (
                <div className="space-y-2">
                  <p className="text-xs text-stone-700">确认申报第 {next.number} 天？提交后此体验记录不可修改。</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => submit('smoke_free')} className="rounded-lg bg-[#1A3B2F] px-3 py-2 text-xs font-bold text-white cursor-pointer">确认：一口也没吸</button>
                    <button onClick={() => submit('smoked')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-800 cursor-pointer">确认：吸过烟</button>
                    <button onClick={() => setConfirmDay(null)} className="px-2 py-2 text-xs text-stone-600 cursor-pointer">稍后再说</button>
                  </div>
                </div>
              ) : <button onClick={() => setConfirmDay(next.number)} className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white cursor-pointer">申报这一天</button>}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-xs mb-2"><span className="font-semibold text-gray-800">14 天记录</span><span className="text-gray-500">无烟 {view.smokeFreeCount} / 14</span></div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {view.days.map((day) => (
                <div key={day.number} title={`${day.date} · ${statusText[day.status]}`} className={`rounded-lg p-1.5 sm:p-2 text-center border min-w-0 ${day.status === 'smoke_free' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : day.status === 'reportable' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-500'}`}>
                  <div className="text-[10px] font-mono font-medium">D{day.number}</div>
                  <div className="my-1 flex justify-center">{day.status === 'smoke_free' ? <CheckCircle2 className="w-4 h-4" /> : day.status === 'reportable' ? <CircleDot className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}</div>
                  <div className="text-[8px] sm:text-[9px] font-bold leading-tight break-words">{statusText[day.status]}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
