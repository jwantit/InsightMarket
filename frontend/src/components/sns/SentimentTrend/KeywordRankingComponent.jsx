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
    <div className="relative h-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">키워드 순위</h3>
        <p className="text-xs text-gray-500">인기 키워드 TOP {wordCloudData.length}</p>
      </div>
      {wordCloudData.length > 0 ? (
        <div className="h-[360px] overflow-y-auto rounded-xl border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-inner">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  순위
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  단어
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  감성
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  건수
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {wordCloudData.map((word, index) => {
                const rank = index + 1;
                const sentimentColorMap = {
                  POS: { text: "긍정", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
                  NEG: { text: "부정", color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
                  NEU: { text: "중립", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
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
                    className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${getRankColor(rank)} text-white font-bold text-xs shadow-sm`}>
                        {getRankBadge(rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {word.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sentiment.bg} ${sentiment.color} border ${sentiment.border}`}>
                        {sentiment.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
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
        <div className="rounded-xl bg-gray-50/50 border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500 font-medium">순위표 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default KeywordRankingComponent;

