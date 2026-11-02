import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  HelpCircle, 
  Wallet, 
  DollarSign, 
  ArrowUpRight,
  Award,
  CircleDot
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContractDashboard({ state, onSimulatePayout }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [payoutModal, setPayoutModal] = useState(false);

  const completedCount = state.completedDays.filter(Boolean).length;
  const currentRefund = completedCount * state.refundPerDay;
  const maxPossible = state.maxRefund;
  const platformFee = state.platformFee;

  const handlePayoutClick = () => {
    if (currentRefund > 0) {
      confetti({ particleCount: 50, spread: 60 });
      setPayoutModal(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-sm space-y-5">
      {/* Contract Title & Status */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#8C1D24] text-white text-[10px] font-serif font-black px-1.5 py-0.5 rounded-xs uppercase tracking-wider">
              14-DAY CONTRACT
            </span>
            <h3 className="text-base font-serif font-black text-gray-900">
              $20 戒烟承诺契约与返还池
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            每天做题打卡立退 $1，最高退还 $14 · 双方共赢正向博弈
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          title="查看经济学模型规则"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Psychology & Business Model Explainer (Toggleable) */}
      {showExplanation && (
        <div className="bg-[#F7F5F0] border border-[#E2DFD6] p-3.5 rounded-xl text-xs text-gray-700 space-y-2 fade-in">
          <div className="font-bold text-gray-900 flex items-center space-x-1">
            <span>⚖️ 为什么是 $20 押金、返还 $14、平台留 $6？</span>
          </div>
          <p className="leading-relaxed text-gray-600">
            传统对赌产品往往希望用户失败来牟取暴利，这会产生天然的对抗心理。<br/>
            在我们的契约中：当你 14 天全胜拿回 <strong>$14</strong> 时，你相当于仅花 <strong>$6</strong>（甚至低于一包烟的价钱）彻底斩断了烟瘾；平台也堂堂正正获得 <strong>$6</strong> 的技术服务利润。
            <strong>我们从第一天起就彻底期盼你胜利！</strong>
          </p>
        </div>
      )}

      {/* Financial Snapshot Card */}
      <div className="grid grid-cols-3 gap-2.5 bg-[#F7F5F0] p-3 rounded-xl border border-[#E2DFD6] text-center">
        <div>
          <div className="text-[10px] text-gray-500 font-medium">承诺押金</div>
          <div className="text-sm font-black font-serif text-gray-900 mt-0.5">
            ${state.stakeAmount}.00
          </div>
        </div>
        <div className="border-x border-stone-200">
          <div className="text-[10px] text-emerald-700 font-medium">已解锁返现</div>
          <div className="text-sm font-black font-serif text-emerald-700 mt-0.5">
            ${currentRefund}.00
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 font-medium">技术服务费</div>
          <div className="text-sm font-black font-serif text-gray-700 mt-0.5">
            ${platformFee}.00
          </div>
        </div>
      </div>

      {/* 14-Day Progress Grid */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-gray-800">14 天返还日历格</span>
          <span className="text-gray-500">
            已履约 <span className="text-emerald-700 font-bold">{completedCount}</span> / 14 天
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 14 }).map((_, idx) => {
            const dayNum = idx + 1;
            const isCompleted = !!state.completedDays[idx];
            const isToday = state.currentDay === dayNum;
            const isLocked = state.currentDay < dayNum;

            return (
              <div
                key={dayNum}
                className={`relative rounded-lg p-2 text-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isToday
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/40'
                    : 'bg-stone-50 border-stone-200 text-gray-400 opacity-60'
                }`}
              >
                <div className="text-[10px] font-mono font-medium">D{dayNum}</div>
                <div className="my-1 flex justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : isToday ? (
                    <CircleDot className="w-4 h-4 text-amber-600 animate-pulse" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>
                <div className="text-[9px] font-bold">
                  {isCompleted ? '+$1' : '$1'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Payout Action */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          到期可一次性原路返还至支付账户
        </div>
        <button
          onClick={handlePayoutClick}
          disabled={currentRefund === 0}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
            currentRefund > 0
              ? 'bg-[#1A3B2F] hover:bg-[#132C23] text-white shadow-xs'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>申请返现结算 (${currentRefund})</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Payout Dialog Simulation */}
      {payoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-stone-200 fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-serif font-black text-lg text-gray-900">
                履约返现已计提
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                当前已累计成功返还 <strong>${currentRefund}.00</strong>。<br />
                在生产环境中，这笔款项将通过 Stripe / 原支付渠道自动退款回原卡。
              </p>
            </div>
            <button
              onClick={() => setPayoutModal(false)}
              className="w-full py-2.5 bg-[#1A3B2F] hover:bg-[#132C23] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              继续保持
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
