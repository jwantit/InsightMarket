import React, { useState, useEffect } from 'react';
import { getBrandSentimentSummary } from '../../api/dashboard/dashboard';
import BrandDonutChart from './BrandDonutChart';
import BrandWordCloudBlock from './BrandWordCloudBlock';
import BrandWordTableBlock from './BrandWordTableBlock';
import BrandSentimentChartSection from './BrandSentimentChartSection';

// 라이브러리 없이 사용하는 SVG 아이콘들
const Icons = {
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    Smile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
    )
};

const BrandSentimentSummary = ({ brandId, appliedChannels, wordData }) => {
    const [sentimentData, setSentimentData] = useState({
        dateRange: "",
        topSource: "",
        mostPositiveDate: "",
        mostNegativeDate: "",
        averagePositiveRatio: "0%",
        posValue: 0,
        negValue: 0,
        neuValue: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
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
        if (brandId) fetchData();
    }, [brandId, appliedChannels]);

    if (loading) return <div className="p-10 text-center text-gray-400 text-xs font-bold animate-pulse">감성 분석 엔진 가동 중...</div>;

    return (
        <div className="w-full bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
                
                {/* 카드 1: 주요 반응 채널 */}
                <div className="group bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-indigo-600">
                        <Icons.Shield />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Main Source</span>
                            <div className="text-indigo-500"><Icons.Shield /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">{sentimentData.dateRange}</p>
                        <p className="text-[13px] text-gray-600 font-bold mb-1">감성 반응이 가장 활발한 채널</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-black text-gray-800">{sentimentData.topSource}</span>
                        </div>
                    </div>
                </div>

                {/* 카드 2: 평균 긍정도 */}
                <div className="group bg-gradient-to-br from-blue-50/50 to-white p-5 rounded-2xl border border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600">
                        <Icons.Smile />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Sentiment Score</span>
                            <div className="text-blue-500"><Icons.Smile /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">{sentimentData.dateRange}</p>
                        <p className="text-[13px] text-gray-600 font-bold mb-1">브랜드 평균 긍정도</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-black text-gray-800">{sentimentData.averagePositiveRatio}</span>
                        </div>
                    </div>
                </div>

                {/* 카드 3: 감성 피크 일자 */}
                <div className="group bg-gradient-to-br from-rose-50/50 to-white p-5 rounded-2xl border border-rose-100 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-rose-600">
                        <Icons.Zap />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Peak Analysis</span>
                            <div className="text-rose-500"><Icons.Zap /></div>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mb-1">주요 감성 피크 일자</p>
                        <div className="flex items-center divide-x divide-rose-100 mt-2">
                            <div className="flex-1 pr-3">
                                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">최고 긍정</p>
                                <p className="text-[13px] font-black text-gray-700">{sentimentData.mostPositiveDate}</p>
                            </div>
                            <div className="flex-1 pl-3">
                                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-tighter">최고 부정</p>
                                <p className="text-[13px] font-black text-gray-700">{sentimentData.mostNegativeDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 블록들 (기존 구조 유지하며 그리드 배치 최적화) */}
                <div className="md:col-span-1 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm min-h-[350px] flex flex-col">
                     <BrandWordCloudBlock wordData={wordData} />
                </div>

                <div className="md:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[350px] flex flex-col overflow-hidden">
                     <BrandWordTableBlock wordData={wordData} />
                </div>

                <div className="md:col-span-1 bg-white p-6 border border-gray-200 rounded-2xl shadow-sm min-h-[350px] flex flex-col">
                     <BrandDonutChart sentimentData={sentimentData} />
                </div>

                <div className="md:col-span-3 bg-white p-8 border border-gray-200 rounded-3xl shadow-sm min-h-[300px] flex flex-col mt-4">
                  <BrandSentimentChartSection 
                    brandId={brandId}
                    appliedChannels={appliedChannels}
                  /> 
                </div>
            </div>
        </div>
    );
};

export default BrandSentimentSummary;