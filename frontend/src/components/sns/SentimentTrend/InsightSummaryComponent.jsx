import React from "react";

const InsightSummaryComponent = ({ insights }) => {
  // 첫번째 인사이트 메시지 (대시보드 스타일)
  const firstInsight = insights && insights.length > 0 ? insights[0] : null;

  return (
    <div>
      {/* 인사이트 메시지 바 (대시보드 스타일) */}
      {firstInsight ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 group hover:border-blue-400 transition-all border-l-4 border-l-blue-600">
          <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-100">
            Insight
          </div>
          <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-relaxed">
            {firstInsight.insightText}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            인사이트 데이터가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default InsightSummaryComponent;
