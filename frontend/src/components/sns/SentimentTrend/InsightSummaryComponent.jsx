import React from "react";

const InsightSummaryComponent = ({ insights }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 rounded-2xl shadow-lg border border-indigo-100/50 p-8 backdrop-blur-sm">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              인사이트 요약
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">AI 기반 분석 결과</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-indigo-100/80 backdrop-blur-sm border border-indigo-200/50">
          <span className="text-xs font-semibold text-indigo-700">
            상위 {Math.min(5, insights.length)}개
          </span>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="relative py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500 font-medium">인사이트 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {insights.slice(0, 5).map((insight, index) => (
            <div
              key={insight.insightId}
              className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-indigo-100/50 p-5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-r-full" />
              
              {/* Content */}
              <div className="pl-4">
                <p className="text-sm font-medium text-gray-800 leading-relaxed group-hover:text-gray-900 transition-colors">
                  {insight.insightText}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="tabular-nums font-medium">{insight.statDate}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    {insight.source}
                  </span>
                </div>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-xl" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightSummaryComponent;

