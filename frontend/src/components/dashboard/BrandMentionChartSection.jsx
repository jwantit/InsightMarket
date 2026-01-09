import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getBrandMentionChart } from "../../api/dashboard/dashboard";

const BrandMentionChartSection = ({ brandId, appliedChannels }) => {
  const [data, setData] = useState([]);
  const [unit, setUnit] = useState("day"); // 기존처럼 일별/주별 상태 유지
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "day", label: "일별" },
    { id: "week", label: "주별" },
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      if (!brandId) return;
      setLoading(true);
      try {
        const result = await getBrandMentionChart(
          brandId,
          appliedChannels,
          unit
        );
        setData(result.chartData || []);
      } catch (error) {
        console.error("차트 데이터를 가져오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [brandId, appliedChannels, unit]);

  return (
    // 내부의 bg-gray-50, border, shadow 등을 제거하여 외부 p-6 컨테이너와 밀착시킴
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[15px] font-extrabold text-gray-800 tracking-tight text-sm">
            언급량 추이
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 font-medium">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            {loading ? "데이터 분석 중..." : "채널별 언급량 변화 리포트입니다."}
          </p>
        </div>

        {/* 기존의 일별/주별 탭 유지 */}
        <div className="flex bg-gray-100 p-0.5 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setUnit(tab.id)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-200 ${
                unit === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역: bg-white와 border를 제거하고 부모 공간을 flex-1로 채움 */}
      <div
        className="w-full relative"
        style={{ minHeight: "250px", height: "250px" }}
      >
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
          <div style={{ width: "100%", height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
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
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                    fontSize: "11px",
                  }}
                  formatter={(value, name, props) => {
                    if (name === "count") {
                      const { naver, youtube } = props.payload;
                      return [
                        `네이버: ${naver}, 유튜브: ${youtube}`,
                        "전체 언급량",
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3b82f6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandMentionChartSection;
