import React from "react";

const InsightSummaryComponent = ({ insights }) => {
  return (
    <div className="w-full bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-800">인사이트 요약</h2>
        <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
          <span className="text-[10px] font-semibold text-blue-700">
            상위 {Math.min(5, insights.length)}개
          </span>
        </div>
      </div>
      <div className="p-4">
        {insights.length === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              인사이트 데이터가 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight, index) => (
              <div
                key={insight.insightId}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-blue-500 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-800 leading-relaxed">
                      {insight.insightText}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="tabular-nums font-medium">
                          {insight.statDate}
                        </span>
                      </div>
                      <div className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-semibold rounded">
                        {insight.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightSummaryComponent;
