import React from "react";
import { Line } from "react-chartjs-2";

const MentionAnalysisComponent = ({
  mentionChartData,
  summaryStats,
  selectedSources,
  baseChartOptions,
}) => {
  // 대시보드와 동일한 아이콘
  const Icons = {
    Chart: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    Shield: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    Calendar: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  };

  const statCards = [
    {
      label: "총 언급량",
      value: summaryStats?.totalMentions?.toLocaleString() || "0",
      subtext: summaryStats?.dateRange || "",
      description: "건 기준 집계",
      icon: Icons.Chart,
      color: "indigo",
    },
    {
      label: "최다 채널",
      value: summaryStats?.topSource?.name || "-",
      subtext: summaryStats?.dateRange || "",
      description: summaryStats?.topSource
        ? `${summaryStats.topSource.count.toLocaleString()}건`
        : "감성 반응이 가장 활발한 채널",
      icon: Icons.Shield,
      color: "blue",
    },
    {
      label: "급증일",
      value: summaryStats?.topDate?.date || "-",
      subtext: summaryStats?.dateRange || "",
      description: summaryStats?.topDate
        ? `${summaryStats.topDate.count.toLocaleString()}건`
        : "언급량이 가장 높은 날짜",
      icon: Icons.Calendar,
      color: "rose",
    },
  ];

  return (
    <div className="w-full bg-white flex flex-col border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4">
        {/* 언급량 요약 카드 */}
        {summaryStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {statCards.map((card, index) => {
              const colorMap = {
                indigo: {
                  bg: "from-indigo-50/50",
                  border: "border-indigo-100",
                  text: "text-indigo-500",
                  badge: "bg-indigo-100/50",
                  icon: "text-indigo-600",
                },
                blue: {
                  bg: "from-blue-50/50",
                  border: "border-blue-100",
                  text: "text-blue-500",
                  badge: "bg-blue-100/50",
                  icon: "text-blue-600",
                },
                rose: {
                  bg: "from-rose-50/50",
                  border: "border-rose-100",
                  text: "text-rose-500",
                  badge: "bg-rose-100/50",
                  icon: "text-rose-600",
                },
              };
              const colors = colorMap[card.color] || colorMap.indigo;
              const IconComponent = card.icon;

              return (
                <div
                  key={index}
                  className={`group bg-gradient-to-br ${colors.bg} to-white p-5 rounded-2xl border ${colors.border} hover:shadow-md transition-all relative overflow-hidden`}
                >
                  <div className="absolute right-[-10px] top-[-10px] scale-[3] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <IconComponent />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`text-[10px] font-bold ${colors.text} ${colors.badge} px-2 py-0.5 rounded-full uppercase tracking-wider`}
                      >
                        {card.label}
                      </span>
                      <div className={colors.icon}>
                        <IconComponent />
                      </div>
                    </div>
                    {card.subtext && (
                      <p className="text-[11px] text-gray-400 font-medium mb-1">
                        {card.subtext}
                      </p>
                    )}
                    <p className="text-[13px] text-gray-600 font-bold mb-1">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-black text-gray-800">
                        {card.value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 언급량 추이 차트 */}
        <div className="w-full bg-white border border-gray-200 rounded-xl p-6 min-h-[300px]">
          {mentionChartData ? (
            <div className="h-[300px]">
              <Line data={mentionChartData} options={baseChartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentionAnalysisComponent;
