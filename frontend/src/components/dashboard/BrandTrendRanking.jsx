import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useTrendSse } from "../../hooks/dashboard/useTrendSse";

const BrandTrendRanking = ({ brandId }) => {
  const [selectedType, setSelectedType] = useState("rising");
  const { trendData, loading, error } = useTrendSse(brandId);

  if (loading && !trendData) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full flex items-center justify-center text-red-400">
        <p className="text-sm">연결 오류: {error}</p>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full flex items-center justify-center text-gray-400">
        <p className="text-sm">트렌드 데이터가 없습니다.</p>
      </div>
    );
  }

  const currentList =
    (selectedType === "rising"
      ? trendData.data?.rising || []
      : trendData.data?.top || []).slice(0, 20);

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                관련 검색어
              </h3>
              {trendData.keyword && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  기준: {trendData.keyword}
                </p>
              )}
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="rising">급상승</option>
            <option value="top">인기 검색어</option>
          </select>
        </div>
      </div>

      {/* 리스트 영역 - flex-1과 overflow-y-auto, 그리고 min-h-0가 핵심입니다. */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-white">
        {currentList.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 p-10">
            <p className="text-sm">데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-1">
            {currentList.map((item, index) => (
              <div
                key={`${item.query}-${index}`}
                className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-base font-black text-slate-300 min-w-[24px]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-bold text-slate-700 truncate whitespace-nowrap">
                    {item.query}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      selectedType === "rising"
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}
                  >
                    {selectedType === "rising" ? "급상승" : "인기"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      {currentList.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex-shrink-0 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Top 20 Insights
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandTrendRanking;
