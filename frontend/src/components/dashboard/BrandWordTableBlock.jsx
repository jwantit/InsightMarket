import React from 'react';


const BrandWordTableBlock = ({ wordData }) => {
    const safeWords = wordData?.wordCloudRow ? wordData.wordCloudRow.slice(0, 10) : [];

    return (
        <div className="w-full h-full flex flex-col min-h-0 bg-white">
            
            
            {/* 테이블 컨테이너: border-t를 제거하여 헤더가 블록 상단에 붙어 보이게 함 */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                <table className="w-full text-left border-collapse table-fixed">
                    {/* sticky top-0과 bg-gray-50이 경계선 없이 딱 붙음 */}
                    <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr className="text-[10px] font-bold text-gray-400">
                            {/* border-t-0 혹은 border-b만 남겨서 위쪽을 깨끗하게 함 */}
                            <th className="px-2 py-2 border-b border-gray-100 w-[55%]">단어</th>
                            <th className="px-2 py-2 border-b border-gray-100 text-center w-[20%]">긍부정</th>
                            <th className="px-2 py-2 border-b border-gray-100 text-right w-[25%]">언급수</th>
                        </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-50">
                        {safeWords.length > 0 ? (
                            safeWords.map((word, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-2 py-1.5 text-[11px] font-medium text-gray-700 truncate">
                                        <span className="text-gray-300 mr-2 font-mono">{idx + 1}</span>
                                        {word.text}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            word.polarity === 'POS' ? 'bg-blue-50 text-blue-500' : 
                                            word.polarity === 'NEG' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                            {word.polarity === 'POS' ? '긍' : word.polarity === 'NEG' ? '부' : '중'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 text-right text-[11px] font-mono font-bold text-blue-500/70">
                                        {word.value?.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-10 text-center text-gray-300 text-[10px] italic">
                                    데이터 없음
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BrandWordTableBlock;