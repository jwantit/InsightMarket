import React, { useState, useEffect } from "react";
import { TrendingUp, MoreVertical, Download, Code, Share2 } from "lucide-react";
import { getBrandTrends } from "../../api/dashboardApi";

const BrandTrendRanking = ({ brandId }) => {
  const [trendData, setTrendData] = useState(null);
  const [selectedType, setSelectedType] = useState("rising"); // "rising" | "top"
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      if (!brandId) return;
      setLoading(true);
      try {
        const data = await getBrandTrends(brandId);
        setTrendData(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("트렌드 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();

    // 5분 주기로 자동 갱신 (300000ms = 5분)
    const interval = setInterval(() => {
      fetchTrendData();
    }, 300000);

    return () => clearInterval(interval);
  }, [brandId]);

  if (loading && !trendData) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <p className="text-sm">트렌드 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentList =
    selectedType === "rising"
      ? trendData.data?.rising || []
      : trendData.data?.top || [];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden h-full flex flex-col max-h-[500px]">
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
                  기준 키워드: {trendData.keyword}
                </p>
              )}
            </div>
          </div>

          {/* 드롭다운 & 액션 버튼 */}
          <div className="flex items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-[11px] font-bold text-gray-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="rising">급상승</option>
              <option value="top">인기 검색어</option>
            </select>

            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="다운로드"
              >
                <Download size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="코드"
              >
                <Code size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="공유"
              >
                <Share2 size={16} />
              </button>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                title="더 보기"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 마지막 업데이트 시간 */}
        {lastUpdated && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] text-gray-400">
              마지막 업데이트:{" "}
              {lastUpdated.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {trendData.collectedAt &&
                ` (수집: ${new Date(trendData.collectedAt).toLocaleString(
                  "ko-KR"
                )})`}
            </p>
          </div>
        )}
      </div>

      {/* 검색어 리스트 */}
      <div className="p-6 relative flex-1 overflow-y-auto">
        {loading && trendData && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-b-[2rem]">
            <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {currentList.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400">
            <p className="text-sm">
              {selectedType === "rising"
                ? "급상승 검색어가 없습니다."
                : "인기 검색어가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {currentList.map((item, index) => (
              <div
                key={`${item.query}-${index}`}
                className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* 순위 번호 */}
                  <span className="text-lg font-black text-gray-400 min-w-[32px]">
                    {index + 1}
                  </span>

                  {/* 검색어 */}
                  <span className="text-sm font-bold text-gray-800 truncate flex-1">
                    {item.query}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* 상태 배지 */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedType === "rising"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {selectedType === "rising" ? "급상승" : "인기"}
                  </span>

                  {/* 값 (있는 경우) */}
                  {item.value && (
                    <span className="text-xs font-bold text-gray-500">
                      {item.value}
                    </span>
                  )}

                  {/* 더보기 버튼 */}
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all text-gray-400 hover:text-gray-600">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 정보 */}
        {currentList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
            <p className="text-[10px] text-gray-400 text-center">
              {currentList.length}개 검색어 중 1-{currentList.length}번 표시 중
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandTrendRanking;
