import React from "react";
import { Line } from "react-chartjs-2";

const MentionAnalysisComponent = ({
  mentionChartData,
  summaryStats,
  selectedSources,
  baseChartOptions,
}) => {
  const statCards = [
    {
      label: "총 언급량",
      value: summaryStats?.totalMentions?.toLocaleString() || "0",
      subtext: "건 기준 집계",
      icon: "📊",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "최다 채널",
      value: summaryStats?.topSource?.name || "-",
      subtext: summaryStats?.topSource
        ? `${summaryStats.topSource.count.toLocaleString()}건`
        : "",
      icon: summaryStats?.topSource?.name?.[0] || "N",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "급증일",
      value: summaryStats?.topDate?.date || "-",
      subtext: summaryStats?.topDate
        ? `${summaryStats.topDate.count.toLocaleString()}건`
        : "",
      icon: "📅",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 rounded-2xl shadow-lg border border-blue-100/50 p-8 backdrop-blur-sm">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              언급량 분석
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">실시간 트렌드 모니터링</p>
          </div>
        </div>
      </div>

      {/* 언급량 요약 카드 */}
      {summaryStats && (
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-gray-100/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {card.label}
                  </p>
                  <p className={`text-3xl font-bold tabular-nums bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-1`}>
                    {card.value}
                  </p>
                  {card.subtext && (
                    <p className="text-xs text-gray-500 font-medium">{card.subtext}</p>
                  )}
                </div>
                <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <span className={`text-xl font-bold ${card.iconColor}`}>{card.icon}</span>
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          ))}
        </div>
      )}

      {/* 언급량 추이 차트 */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">언급량 추이</h3>
            <p className="text-xs text-gray-500">시간대별 언급량 변화</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200/50">
            <span className="text-xs font-semibold text-blue-700">
              {selectedSources.length === 0
                ? "전체 소스"
                : selectedSources.length === 1
                ? selectedSources[0]
                : `${selectedSources.length}개 소스`}
            </span>
          </div>
        </div>

        {mentionChartData ? (
          <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 p-6 shadow-inner">
            <div className="h-96">
              <Line data={mentionChartData} options={baseChartOptions} />
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
      </div>
    </div>
  );
};

export default MentionAnalysisComponent;
