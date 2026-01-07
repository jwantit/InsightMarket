// src/components/dashboard/BrandMentionSummary.jsx
import React, { useState, useEffect } from "react";
import { Globe, Flame, TrendingUp } from "lucide-react";
import { getBrandMentionSummary } from "../../api/dashboard/dashboard";
import BrandMentionChartSection from "./BrandMentionChartSection";
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* 메인 추이 차트 */}
        <div className="md:col-span-3 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <BrandMentionChartSection
            brandId={brandId}
            appliedChannels={appliedChannels}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandMentionSummary;
