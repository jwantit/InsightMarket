// src/components/dashboard/BrandMentionSummary.jsx
import React, { useState, useEffect } from "react";
import { Globe, Flame, TrendingUp } from "lucide-react";
import { getBrandMentionSummary } from "../../api/dashboardApi";
import BrandMentionChartSection from "./BrandMentionChartSection";
import BrandTrendRanking from "./BrandTrendRanking";
import StatCard from "./StatCard";

const BrandMentionSummary = ({ brandId, appliedChannels }) => {
  const [mentionSummary, setMentionSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!brandId || appliedChannels.length === 0) return;
      setLoading(true);
      try {
        const data = await getBrandMentionSummary(brandId, appliedChannels);
        setMentionSummary(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brandId, appliedChannels]);

  if (loading)
    return (
      <div className="p-20 text-center bg-white rounded-[2rem] border border-slate-100 animate-pulse">
        <p className="text-sm font-bold text-slate-400">
          언급량 데이터 분석 중...
        </p>
      </div>
    );
  if (!mentionSummary) return null;

  return (
    <div className="space-y-6">
      {/* 인사이트 메시지 바 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 group hover:border-blue-400 transition-all border-l-4 border-l-blue-600">
        <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-blue-100">
          Insight
        </div>
        <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-relaxed">
          {mentionSummary.insightMessage}
        </p>
      </div>

      {/* PC(1440px 이상)에서 가로 배치, 그 미만은 세로로 자동 배치 */}
      <div className="grid grid-cols-1 min-[1440px]:grid-cols-3 gap-6 items-stretch">
        
        {/* 왼쪽 영역: 카드 + 차트 */}
        <div className="min-[1440px]:col-span-2 flex flex-col gap-6">
          {/* 요약 카드 3개 - 1440px 이상에서 가로 배치, 그 이하는 세로 배치 */}
          <div className="grid grid-cols-1 min-[1440px]:grid-cols-3 gap-6">
            <StatCard
              label="Top Channel"
              value={mentionSummary.popularChannel}
              icon={Globe}
              color="blue"
              range={mentionSummary.dateRange}
              desc="가장 언급이 활발한 채널"
            />
            <StatCard
              label="Peak Analysis"
              value={mentionSummary.peakDate}
              icon={Flame}
              color="orange"
              range={mentionSummary.dateRange}
              desc="데이터 최고점 발생일"
            />
            <StatCard
              label="Growth"
              value={mentionSummary.weeklyGrowthRate}
              icon={TrendingUp}
              color="emerald"
              range={mentionSummary.dateRange}
              desc="전주 대비 언급량 변화"
            />
          </div>

          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-[350px] sm:h-[450px] overflow-hidden">
            <BrandMentionChartSection
              brandId={brandId}
              appliedChannels={appliedChannels}
            />
          </div>
        </div>

        {/* 오른쪽 영역: 연관 검색어 */}
        <div className="min-[1440px]:col-span-1 relative h-[450px] sm:h-[500px] min-[1440px]:h-auto min-[1440px]:min-h-0">
          <div className="min-[1440px]:absolute min-[1440px]:inset-0 w-full h-full">
            <BrandTrendRanking brandId={brandId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandMentionSummary;
