import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const SentimentRatioComponent = ({
  sentimentDoughnutData,
  sentimentAverages,
  doughnutOptions,
  summaryStats,
  size = "large", // "large" | "small"
}) => {
  // Chart.js 형식을 recharts 형식으로 변환
  const chartData = useMemo(() => {
    if (!sentimentAverages) return [];

    return [
      { name: "긍정", value: Number(sentimentAverages.pos) || 0 },
      { name: "중립", value: Number(sentimentAverages.neu) || 0 },
      { name: "부정", value: Number(sentimentAverages.neg) || 0 },
    ];
  }, [sentimentAverages]);

  // 대시보드와 동일한 색상
  const COLORS = {
    positive: "#3B82F6", // blue-500
    neutral: "#FACC15", // yellow-400
    negative: "#FF0055", // 부정 빨강
  };

  if (!chartData || chartData.length === 0 || !sentimentAverages) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
              긍부정 비율
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
              평균(%) 기준
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  // size에 따른 높이 설정
  const chartHeight = size === "small" ? "h-48" : "h-96";
  const centerTextSize = size === "small" ? "text-2xl" : "text-4xl";
  const centerLabelSize = size === "small" ? "text-[8px]" : "text-[10px]";

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
            긍부정 비율
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            평균(%) 기준
          </p>
        </div>
      </div>

      <div
        className={`w-full relative ${chartHeight} flex items-center justify-center`}
      >
        {/* 중앙 텍스트 */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none z-10">
          <span
            className={`${centerTextSize} font-black text-[#FF0055] leading-none`}
          >
            {Number(sentimentAverages.neg).toFixed(1)}%
          </span>
          <span
            className={`${centerLabelSize} font-black text-[#FF0055] mt-2 uppercase tracking-widest`}
          >
            부정 비율
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {/* 대시보드와 동일한 색상 */}
              <Cell fill={COLORS.positive} /> {/* 긍정: #3B82F6 */}
              <Cell fill={COLORS.neutral} /> {/* 중립: #FACC15 */}
              <Cell fill={COLORS.negative} /> {/* 부정: #FF0055 */}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "15px",
                border: "none",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                fontWeight: "900",
                fontSize: "12px",
                padding: "10px 14px",
              }}
              formatter={(value, name) => [`${value.toFixed(1)}%`, `${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - 대시보드와 동일한 스타일 */}
      <div className="mt-4 flex gap-3">
        {[
          {
            label: "긍정",
            val: sentimentAverages.pos,
            color: COLORS.positive,
            text: "text-[#3B82F6]",
          },
          {
            label: "중립",
            val: sentimentAverages.neu,
            color: COLORS.neutral,
            text: "text-yellow-600",
          },
          {
            label: "부정",
            val: sentimentAverages.neg,
            color: COLORS.negative,
            text: "text-[#FF0055]",
          },
        ].map((item) => (
          <div key={item.label} className="flex-1 flex flex-col items-center">
            <span className="text-[9px] font-black text-gray-300 mb-1 uppercase">
              {item.label}
            </span>
            <div
              className="w-full h-1.5 rounded-full mb-1 shadow-sm"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className={`text-[11px] font-black ${item.text}`}>
              {Number(item.val).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentRatioComponent;
