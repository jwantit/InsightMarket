import React from "react";

const KeywordRankingComponent = ({ wordCloudData }) => {
  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-orange-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-orange-300 to-orange-400";
    return "from-gray-100 to-gray-200";
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
            키워드 순위
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            인기 키워드 TOP {wordCloudData.length}
          </p>
        </div>
      </div>
      {wordCloudData.length > 0 ? (
        <div className="h-[360px] overflow-y-auto border border-gray-200 rounded-lg bg-white">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                  순위
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                  단어
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                  감성
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase">
                  건수
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {wordCloudData.map((word, index) => {
                const rank = index + 1;
                const sentimentColorMap = {
                  POS: {
                    text: "긍정",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                  },
                  NEG: {
                    text: "부정",
                    color: "text-red-600",
                    bg: "bg-red-50",
                    border: "border-red-200",
                  },
                  NEU: {
                    text: "중립",
                    color: "text-gray-600",
                    bg: "bg-gray-50",
                    border: "border-gray-200",
                  },
                };
                const sentiment = sentimentColorMap[word.sentiment] || {
                  text: "알 수 없음",
                  color: "text-gray-500",
                  bg: "bg-gray-100",
                  border: "border-gray-200",
                };

                return (
                  <tr
                    key={index}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center justify-center w-6 h-6 rounded bg-gray-200 text-gray-700 font-bold text-[10px]`}
                      >
                        {getRankBadge(rank)}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {word.text}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${sentiment.bg} ${sentiment.color} border ${sentiment.border}`}
                      >
                        {sentiment.text}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <span className="font-bold text-gray-900 tabular-nums">
                        {word.value.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm border border-gray-200 rounded-lg">
          순위표 데이터가 없습니다.
        </div>
      )}
    </div>
  );
};

export default KeywordRankingComponent;
