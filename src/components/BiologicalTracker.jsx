import React from 'react';
import { HeartPulse, Wind, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

export default function BiologicalTracker({ state }) {
  const completedCount = state.completedDays.filter(Boolean).length;
  // Estimate avoided cigarettes (e.g. 15 per day) + intercepted cravings
  const estimatedAvoidedCigs = Math.max(
    state.totalCravingsIntercepted * 2,
    completedCount * state.cigsPerDay
  );
  // Money saved on tobacco (e.g. $8 per 20 cigarettes)
  const savedTobaccoMoney = ((estimatedAvoidedCigs / 20) * state.smokePackPrice).toFixed(1);

  const recoveryMilestones = [
    {
      time: '20 分钟',
      title: '心率与血压平复',
      desc: '末梢毛细血管痉挛缓解，心肌供氧恢复正常基线。',
      achieved: completedCount >= 1 || state.totalCravingsIntercepted >= 1
    },
    {
      time: '24 小时',
      title: '一氧化碳彻底排空',
      desc: '红细胞携氧能力恢复100%，肺叶开始清除积聚的黏液。',
      achieved: completedCount >= 1
    },
    {
      time: '48 小时',
      title: '味觉与嗅觉神经再生',
      desc: '舌苔味蕾与鼻腔黏膜神经末梢苏醒，重新感受咖啡与美食的细腻层次。',
      achieved: completedCount >= 2
    },
    {
      time: '72 小时',
      title: '支气管平滑肌舒张',
      desc: '肺活量显著上升，深呼吸时胸腔压迫感基本消除。',
      achieved: completedCount >= 3
    },
    {
      time: '14 天',
      title: '大脑多巴胺受体正常化',
      desc: '不再需要尼古丁借贷快乐，生理依赖彻底归零。',
      achieved: completedCount >= 14
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-[#1A3B2F]" />
          <h3 className="text-base font-serif font-black text-gray-900">
            生理修复与财务复利看板
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
          Real-time Health ROI
        </span>
      </div>

      {/* Big Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E2DFD6] text-center">
          <div className="text-[10px] text-gray-500 font-medium">拦截冲动次数</div>
          <div className="text-base font-black font-serif text-[#1A3B2F] mt-0.5">
            {state.totalCravingsIntercepted} <span className="text-xs font-sans font-normal text-gray-500">次</span>
          </div>
        </div>

        <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E2DFD6] text-center">
          <div className="text-[10px] text-gray-500 font-medium">累计少抽卷烟</div>
          <div className="text-base font-black font-serif text-gray-900 mt-0.5">
            {estimatedAvoidedCigs} <span className="text-xs font-sans font-normal text-gray-500">支</span>
          </div>
        </div>

        <div className="bg-[#F7F5F0] p-3 rounded-xl border border-[#E2DFD6] text-center">
          <div className="text-[10px] text-emerald-800 font-medium">额外节省烟钱</div>
          <div className="text-base font-black font-serif text-emerald-700 mt-0.5">
            ${savedTobaccoMoney}
          </div>
        </div>
      </div>

      {/* Biological Timeline Steps */}
      <div className="pt-2">
        <div className="text-xs font-bold text-gray-700 mb-2.5 flex items-center justify-between">
          <span>人体生理机能逆转时间轴</span>
          <span className="text-[10px] font-normal text-gray-400">基于世界卫生组织 (WHO) 数据</span>
        </div>

        <div className="space-y-2">
          {recoveryMilestones.map((m, i) => (
            <div 
              key={i} 
              className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 transition ${
                m.achieved 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : 'bg-stone-50 border-stone-200/60 text-gray-400 opacity-60'
              }`}
            >
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                m.achieved ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-200 text-gray-500'
              }`}>
                {m.time}
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <span>{m.title}</span>
                  {m.achieved && <Sparkles className="w-3 h-3 text-emerald-600 inline" />}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5 leading-snug">
                  {m.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
