import React from 'react';
import { X, BookOpen, Trash2, Quote, BookmarkCheck } from 'lucide-react';

export default function VocabModal({ savedVocab, onClose, onRemoveVocab }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#F7F5F0] rounded-2xl w-full max-w-lg border border-[#E2DFD6] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-white border-b border-[#E2DFD6] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#1A3B2F]" />
            <h3 className="font-serif font-black text-gray-900 text-base">
              抗烟认知武器库 · 词汇与反讽金句
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3">
          {savedVocab.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <Quote className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>暂无收藏。在做题时点击“存入武器库”即可沉淀《经济学人》生词与辛辣金句！</p>
            </div>
          ) : (
            savedVocab.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-4 rounded-xl border border-[#E2DFD6] space-y-2 relative shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-serif font-bold text-base text-gray-900">
                      {item.vocab?.word || item.blank}
                    </span>
                    <span className="font-mono text-xs text-gray-500">
                      {item.vocab?.phonetic}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveVocab(item.id)}
                    className="text-gray-300 hover:text-stone-700 p-1 cursor-pointer"
                    title="移除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-gray-700 font-sans">
                  {item.vocab?.meaning}
                </p>

                <div className="bg-stone-50 p-2.5 rounded-lg border-l-2 border-[#1A3B2F] text-xs font-serif italic text-stone-800">
                  "{item.punchline}"
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#E2DFD6] p-3 text-center text-xs text-gray-500">
          共收录 {savedVocab.length} 个高阶反烟认知词汇
        </div>
      </div>
    </div>
  );
}
