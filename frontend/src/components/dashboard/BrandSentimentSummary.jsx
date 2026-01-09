// src/components/dashboard/BrandSentimentSummary.jsx
import React, { useState, useEffect } from "react";
import { Shield, Smile, Zap } from "lucide-react";
import { getBrandSentimentSummary } from "../../api/dashboard/dashboard";
import BrandDonutChart from "./BrandDonutChart";
import BrandWordCloudBlock from "./BrandWordCloudBlock";
import BrandWordTableBlock from "./BrandWordTableBlock";
import BrandSentimentChartSection from "./BrandSentimentChartSection";
import StatCard from "./StatCard";

const BrandSentimentSummary = ({ brandId, appliedChannels, wordData }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!brandId) return;
      setLoading(true);
      try {
        const data = await getBrandSentimentSummary(brandId, appliedChannels);
        setSentimentData(data);
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
        <p className="text-sm font-bold text-slate-400">감성 지표 계산 중...</p>
      </div>
    );
  if (!sentimentData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Main Source"
        value={sentimentData.topSource}
        icon={Shield}
        color="blue"
        range={sentimentData.dateRange}
        desc="감성 활성 채널"
      />
      <StatCard
        label="Brand Sentiment"
        value={sentimentData.averagePositiveRatio}
        icon={Smile}
        color="indigo"
        range={sentimentData.dateRange}
        desc="평균 브랜드 긍정도"
      />

      {/* 피크 분석 특수 카드 */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-rose-400 transition-all">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg border border-rose-100 uppercase tracking-tighter">
            Peak Analysis
          </span>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-inner">
            <Zap size={18} />
          </div>
        </div>
        <div className="flex items-center divide-x divide-slate-100 mt-2">
          <div className="flex-1 pr-4">
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">
              Max Positive
            </p>
            <p className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
              {sentimentData.mostPositiveDate}
            </p>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1">
              Max Negative
            </p>
            <p className="text-xl font-black text-slate-900 group-hover:text-rose-600 transition-colors leading-none">
              {sentimentData.mostNegativeDate}
            </p>
          </div>
        </div>
      </div>

      {/* 시각화 도구 블록들 */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[420px] hover:shadow-lg transition-shadow">
        <BrandWordCloudBlock wordData={wordData} />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm min-h-[420px] overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6 pb-2 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Sentiment Word Table
          </h3>
        </div>
        <BrandWordTableBlock wordData={wordData} />
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[420px] h-full flex flex-col hover:shadow-lg transition-shadow">
        <BrandDonutChart sentimentData={sentimentData} />
      </div>

      {/* 하단 전체 영역 감성 추이 차트 */}
      <div className="md:col-span-3 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[350px] hover:shadow-lg transition-shadow">
        <BrandSentimentChartSection
          brandId={brandId}
          appliedChannels={appliedChannels}
        />
      </div>
    </div>
  );
};

export default BrandSentimentSummary;
