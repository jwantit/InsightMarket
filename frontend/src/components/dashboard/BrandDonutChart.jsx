import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const BrandDonutChart = ({ sentimentData }) => {
    if (!sentimentData) return null;

    const chartData = [
        { name: '긍정', value: Number(sentimentData.posValue) || 0 },
        { name: '중립', value: Number(sentimentData.neuValue) || 0 },
        { name: '부정', value: Number(sentimentData.negValue) || 0 },
    ];

    return (
        <div className="flex-1 w-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-700 self-start mb-auto">긍 · 부정 차트</h3>

            <div className="flex-1 relative min-h-[220px] flex items-center justify-center">
                <div className="absolute flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-4xl font-black text-[#FF0055] leading-none">
                     {sentimentData.negValue}%
                  </span>
                  <span className="text-[10px] font-black text-[#FF0055] mt-2 uppercase tracking-widest">
                      부정 비율
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%" cy="50%" 
                            innerRadius="65%"
                            outerRadius="95%"
                            paddingAngle={0} 
                            dataKey="value" 
                            stroke="none"
                        >
                            {/* ✅ 차트 도넛 색상: 시원한 파랑 - 노랑 - 빨강 */}
                            <Cell fill="#3B82F6" /> {/* 긍정: 시원한 블루 (blue-500) */}
                            <Cell fill="#FACC15" /> {/* 중립: 선명한 노랑 (yellow-400) */}
                            <Cell fill="#FF0055" /> {/* 부정: 쨍한 빨강 */}
                        </Pie>
                        
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '15px', 
                                border: 'none', 
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                fontWeight: '900',
                                fontSize: '12px',
                                padding: '10px 14px'
                            }}
                            formatter={(value, name) => [`${value}%`, `${name}`]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex gap-3">
                {[
                    { label: '긍정', val: sentimentData.posValue, color: 'bg-[#3B82F6]', text: 'text-[#3B82F6]' },
                    { label: '중립', val: sentimentData.neuValue, color: 'bg-yellow-400', text: 'text-yellow-600' },
                    { label: '부정', val: sentimentData.negValue, color: 'bg-[#FF0055]', text: 'text-[#FF0055]' }
                ].map((item) => (
                    <div key={item.label} className="flex-1 flex flex-col items-center">
                        <span className="text-[9px] font-black text-gray-300 mb-1 uppercase">{item.label}</span>
                        <div className={`w-full h-1.5 rounded-full mb-1 ${item.color} shadow-sm`}></div>
                        <span className={`text-[11px] font-black ${item.text}`}>{item.val}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BrandDonutChart;