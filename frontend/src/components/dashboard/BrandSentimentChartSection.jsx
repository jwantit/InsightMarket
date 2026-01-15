import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getBrandSentimentChart } from '../../api/dashboardApi';

const BrandSentimentChartSection = ({ brandId, appliedChannels, unit = 'day' }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchChartData = async () => {
            if (!brandId) return;
            setLoading(true);
            try {
                // 부모로부터 받은 unit(기본값 'day')을 사용하여 데이터 호출
                const response = await getBrandSentimentChart(brandId, appliedChannels, unit);
                const sentimentData = response.sentiment || [];
                setData(sentimentData); 
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [brandId, appliedChannels, unit]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum, entry) => sum + entry.value, 0);
            return (
                <div className="bg-white/95 backdrop-blur-sm p-3 shadow-xl rounded-xl border border-gray-100 min-w-[140px]">
                    <p className="text-[11px] font-bold text-gray-400 mb-2 border-b pb-1">{label}</p>
                    <div className="space-y-1.5">
                        {payload.slice().reverse().map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                                    <span className="text-[11px] font-medium text-gray-600">{entry.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] font-bold text-gray-800">{entry.value.toFixed(1)}</span>
                                    <span className="text-[9px] text-gray-400 ml-1">({((entry.value / total) * 100).toFixed(0)}%)</span>
                                </div>
                            </div>
                        ))}
                        <div className="pt-1 mt-1 border-t border-dashed flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-500">총합</span>
                            <span className="text-[11px] font-black text-blue-600">{total.toFixed(1)} 건</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full flex flex-col">
            {/* 상단 헤더: 버튼 탭을 제거하고 텍스트만 남김 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">긍부정 추이 분석 week</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                        수집된 소셜 데이터를 기반으로 한 감성 분포입니다.
                    </p>
                </div>
                {/* 탭 버튼이 있던 자리: 비워두거나 작은 상태 아이콘 등을 넣을 수 있음 */}
            </div>

            {/* 차트 영역 */}
            <div className="w-full relative" style={{ minHeight: '220px', height: '220px' }}>
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                )}
                
                {!loading && (!data || data.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <p className="text-sm text-gray-400">데이터가 없습니다.</p>
                    </div>
                )}
                
                {!loading && data && data.length > 0 && (
                    <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                                    dy={8}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.4 }} />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right"
                                    iconType="circle"
                                    iconSize={6}
                                    wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingBottom: '15px' }} 
                                />
                                <Bar dataKey="positive" name="긍정" stackId="a" fill="#6366f1" barSize={32} />
                                <Bar dataKey="neutral" name="중립" stackId="a" fill="#fde047" />
                                <Bar dataKey="negative" name="부정" stackId="a" fill="#fb7185" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandSentimentChartSection;