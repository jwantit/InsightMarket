import { getBrandMentionSummary } from '../../api/dashboard/dashboard';
import React, { useState, useEffect } from 'react';
import BrandMentionChartSection from './BrandMentionChartSection';

const BrandMentionSummary = ({ brandId, appliedChannels }) => {
  const [mentionSummary, setMentionSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const Icons = {
    Globe: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    ),
    Flame: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
    ),
    TrendingUp: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    )
  };

  useEffect(() => {
    const fetchData = async () => {
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

    if (brandId && appliedChannels.length > 0) {
      fetchData();
    }
  }, [brandId, appliedChannels]);

  if (loading) return <div className="p-10 text-center text-gray-400 text-xs">데이터를 분석하고 있습니다...</div>;
  if (!mentionSummary) return null;

  return (
    <div className="w-full bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* 1. 맨 위 제목 */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center">
        <h2 className="text-sm font-bold text-gray-800">insight message</h2>
      </div>

      {/* 2. 상단 가로 요약 멘트 바 */}
      <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-2">
       <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
         요약
       </span>
       <p className="text-[12px] text-gray-600 truncate">
       {mentionSummary.insightMessage} 
       </p>
      </div>


      {/* 3. 3개로 구성된 데이터 카드 행 */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
        {/* 카드 1: 주간 성장률 */}
        <div className="group bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-2xl border border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600">
            <Icons.Globe />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-blue-500 bg-blue-100/50 px-2 py-0.5 rounded-full">CHANNEL</span>
              <div className="text-blue-500"><Icons.Globe /></div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">{mentionSummary.dateRange}</p>
            <p className="text-[13px] text-gray-600 font-bold">언급량이 가장 많은 채널</p>
            <p className="text-2xl font-black text-gray-800 mt-2">{mentionSummary.popularChannel}</p>
          </div>
        </div>

        {/* 카드 2: 인기 채널 */}
        <div className="group bg-gradient-to-br from-orange-50/50 to-white p-5 rounded-2xl border border-orange-100 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-orange-600">
            <Icons.Flame />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-orange-500 bg-orange-100/50 px-2 py-0.5 rounded-full">PEAK DATE</span>
              <div className="text-orange-500"><Icons.Flame /></div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">{mentionSummary.dateRange}</p>
            <p className="text-[13px] text-gray-600 font-bold">언급량이 가장 많았던 일자</p>
            <p className="text-2xl font-black text-gray-800 mt-2">{mentionSummary.peakDate}</p>
          </div>
        </div>

        {/* 카드 3: 최고 언급일 */}
        <div className="group bg-gradient-to-br from-emerald-50/50 to-white p-5 rounded-2xl border border-emerald-100 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-emerald-600">
            <Icons.TrendingUp />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100/50 px-2 py-0.5 rounded-full">GROWTH</span>
              <div className="text-emerald-500"><Icons.TrendingUp /></div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">{mentionSummary.dateRange}</p>
            <p className="text-[13px] text-gray-600 font-bold">전주 대비 언급량 증감률</p>
            <p className="text-2xl font-black text-gray-800 mt-2">{mentionSummary.weeklyGrowthRate}</p>
          </div>
        </div>

        <div className="md:col-span-3 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm min-h-[300px] flex flex-col mt-2">
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