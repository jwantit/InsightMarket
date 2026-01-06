import React from "react";
import { Doughnut } from "react-chartjs-2";
import { TOKENS, doughnutCenterTextPlugin } from "./utils";

const SentimentRatioComponent = ({
  sentimentDoughnutData,
  sentimentAverages,
  doughnutOptions,
  summaryStats,
}) => {
  const legendItems = [
    { label: "긍정", val: sentimentAverages.pos, color: TOKENS.color.positive, gradient: "from-green-500 to-emerald-500", bg: "bg-green-50", border: "border-green-200" },
    { label: "부정", val: sentimentAverages.neg, color: TOKENS.color.negative, gradient: "from-red-500 to-rose-500", bg: "bg-red-50", border: "border-red-200" },
    { label: "중립", val: sentimentAverages.neu, color: TOKENS.color.neutral, gradient: "from-yellow-500 to-amber-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  ];

  return (
    <div className="lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">긍부정 비율</h3>
          <p className="text-xs text-gray-500">평균(%)</p>
        </div>
      </div>

      {sentimentDoughnutData ? (
        <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 p-6 shadow-inner">
          <div className="h-96">
            <Doughnut
              data={sentimentDoughnutData}
              options={doughnutOptions}
              plugins={[doughnutCenterTextPlugin]}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50/50 border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500 font-medium">데이터가 없습니다.</p>
        </div>
      )}

      {/* Enhanced legend */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className={`relative overflow-hidden rounded-xl ${item.bg} border-2 ${item.border} p-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${item.gradient} shadow-sm`} />
              <span className="text-xs font-bold text-gray-700">{item.label}</span>
            </div>
            <div className="text-lg font-bold tabular-nums bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
              {Number(item.val).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentRatioComponent;

