import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SentimentTrendComponent = ({ sentimentBarData, stackedBarOptions }) => {
  // Chart.js 형식을 recharts 형식으로 변환
  const chartData = useMemo(() => {
    if (!sentimentBarData || !sentimentBarData.labels) return [];

    const { labels, datasets } = sentimentBarData;
    return labels.map((date, index) => {
      const positive =
        datasets.find((d) => d.label === "긍정")?.data[index] || 0;
      const neutral =
        datasets.find((d) => d.label === "중립")?.data[index] || 0;
      const negative =
        datasets.find((d) => d.label === "부정")?.data[index] || 0;

      return {
        date,
        positive: Number(positive.toFixed(1)),
        neutral: Number(neutral.toFixed(1)),
        negative: Number(negative.toFixed(1)),
      };
    });
  }, [sentimentBarData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 shadow-xl rounded-xl border border-gray-100 min-w-[140px]">
          <p className="text-[11px] font-bold text-gray-400 mb-2 border-b pb-1">
            {label}
          </p>
          <div className="space-y-1.5">
            {payload
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-[11px] font-medium text-gray-600">
                      {entry.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-gray-800">
                      {entry.value.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-400 ml-1">
                      (
                      {total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            <div className="pt-1 mt-1 border-t border-dashed flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500">총합</span>
              <span className="text-[11px] font-black text-blue-600">
                {total.toFixed(1)} %
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
              긍부정 추이 분석
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
              스택(%) 기준 / 일자별 분포
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
            긍부정 추이 분석
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            스택(%) 기준 / 일자별 분포
          </p>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              domain={[0, 100]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f8fafc", opacity: 0.4 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={6}
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: 600,
                paddingBottom: "15px",
              }}
            />
            <Bar
              dataKey="positive"
              name="긍정"
              stackId="a"
              fill="#6366f1"
              barSize={32}
            />
            <Bar dataKey="neutral" name="중립" stackId="a" fill="#fde047" />
            <Bar
              dataKey="negative"
              name="부정"
              stackId="a"
              fill="#fb7185"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentTrendComponent;
