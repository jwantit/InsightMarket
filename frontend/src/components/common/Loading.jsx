// src/components/common/Loading.jsx
import React from "react";
import { Loader2, Sparkles } from "lucide-react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* 바깥쪽 회전 링 */}
        <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>

        {/* 중앙 아이콘 (반짝임 효과) */}
        <div className="absolute flex items-center justify-center text-blue-600 animate-pulse">
          <Sparkles size={32} />
        </div>
      </div>

      {/* 로딩 텍스트 */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
          Insight<span className="text-blue-600">Market</span>
        </h2>
      </div>

      {/* 하단 진행 바 (장식용) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 animate-[loading_2s_infinite_ease-in-out]"></div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
            width: 30%;
          }
          50% {
            width: 60%;
          }
          100% {
            transform: translateX(400%);
            width: 30%;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
