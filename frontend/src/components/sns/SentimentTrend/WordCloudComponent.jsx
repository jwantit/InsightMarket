import React, { useEffect, useRef } from "react";
import { cx, sentimentColor, sentimentLabel, badgeStyle } from "./utils";

// amCharts4는 CDN으로 로드되므로 전역 객체 사용
const am4core = window.am4core;
const am4plugins_wordCloud = window.am4plugins_wordCloud;
const am4themes_animated = window.am4themes_animated;

const WordCloudComponent = ({
  wordCloudData,
  wordCloudMeta,
  wordView,
  setWordView,
  wordSearch,
  setWordSearch,
  activeSentiments,
  toggleSentiment,
  selectedToken,
  setSelectedToken,
  tokenStats,
}) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            긍·부정 원인 키워드
          </h3>
          <p className="text-xs text-gray-500">
            크기=언급량 / 색=감성. 클릭하면 선택(하이라이트)됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={wordSearch}
              onChange={(e) => setWordSearch(e.target.value)}
              placeholder="키워드 검색"
              className="w-44 md:w-56 pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
            />
          </div>
          {/* Tabs */}
          <div className="flex p-1 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
            <button
              onClick={() => setWordView("cloud")}
              className={cx(
                "px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200",
                wordView === "cloud"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              워드맵
            </button>
            <button
              onClick={() => setWordView("table")}
              className={cx(
                "px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200",
                wordView === "table"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              표
            </button>
          </div>
        </div>
      </div>

      {/* Sentiment toggles */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["POS", "NEG", "NEU"].map((s) => {
          const active = activeSentiments.includes(s);
          const b = badgeStyle(s);
          const colorMap = {
            POS: { gradient: "from-green-500 to-emerald-500", bg: "bg-green-50", border: "border-green-300" },
            NEG: { gradient: "from-red-500 to-rose-500", bg: "bg-red-50", border: "border-red-300" },
            NEU: { gradient: "from-yellow-500 to-amber-500", bg: "bg-yellow-50", border: "border-yellow-300" },
          };
          const colors = colorMap[s] || { gradient: "from-gray-500 to-gray-600", bg: "bg-gray-50", border: "border-gray-300" };
          
          return (
            <button
              key={s}
              onClick={() => toggleSentiment(s)}
              className={cx(
                "px-4 py-2 rounded-xl border-2 text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm",
                active
                  ? `${colors.bg} ${colors.border} text-gray-900 hover:shadow-md`
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              )}
              title={`${sentimentLabel(s)} 필터`}
            >
              <span
                className={cx(
                  "inline-block w-3 h-3 rounded-full shadow-sm",
                  active ? `bg-gradient-to-br ${colors.gradient}` : "bg-gray-300"
                )}
              />
              <span>{sentimentLabel(s)}</span>
            </button>
          );
        })}

        {selectedToken && (
          <button
            onClick={() => setSelectedToken(null)}
            className="ml-auto text-xs px-3 py-1.5 rounded-full border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-all duration-200 hover:scale-105 shadow-sm"
          >
            선택 해제
          </button>
        )}
      </div>

      {/* Content */}
      {wordCloudData.length === 0 ? (
        <div className="py-14 text-center text-gray-500">
          <p className="font-medium">표시할 키워드가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-2">
            토큰 통계 데이터: {tokenStats.length}개 / 필터 조건을 확인하세요.
          </p>
        </div>
      ) : wordView === "cloud" ? (
        <WordCloudChart
          wordCloudData={wordCloudData}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
      ) : (
        <div className="h-[360px] overflow-y-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  단어
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  감성
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  언급량
                </th>
              </tr>
            </thead>
            <tbody>
              {wordCloudData.map((w, idx) => {
                const b = badgeStyle(w.sentiment);
                const isSelected = selectedToken === w.text;
                return (
                  <tr
                    key={`${w.text}-${idx}`}
                    className={cx(
                      "border-b hover:bg-gray-50 transition-colors",
                      isSelected ? "bg-indigo-50" : ""
                    )}
                    onClick={() =>
                      setSelectedToken((prev) =>
                        prev === w.text ? null : w.text
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {w.text}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ background: b.bg, color: b.text }}
                      >
                        {sentimentLabel(w.sentiment)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-700">
                      {w.value.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// amCharts4 WordCloud Chart Component
const WordCloudChart = ({ wordCloudData, selectedToken, setSelectedToken }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // amCharts가 로드될 때까지 대기
    if (!window.am4core || !window.am4plugins_wordCloud) {
      console.warn("amCharts4가 아직 로드되지 않았습니다.");
      return;
    }

    // Cleanup previous chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose();
      chartInstanceRef.current = null;
    }

    if (!wordCloudData || wordCloudData.length === 0) return;
    if (!chartRef.current) return;

    // Create chart (애니메이션 테마 제거)
    const chart = am4core.create(chartRef.current, am4plugins_wordCloud.WordCloud);
    chartInstanceRef.current = chart;
    
    // 애니메이션 완전 비활성화
    chart.animationDuration = 0;
    if (chart.animationOptions) {
      chart.animationOptions.disabled = true;
    }

    // Create series
    const series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());
    
    // Set data fields
    series.dataFields.word = "word";
    series.dataFields.value = "value";

    // Configure font sizes - value에 따라 자동으로 크기 조정
    series.minFontSize = am4core.percent(12);
    series.maxFontSize = am4core.percent(50);
    
    // value 범위를 명시적으로 설정하여 크기 비율 유지
    const values = wordCloudData.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // value 범위 설정
    if (minValue !== maxValue) {
      series.minValue = minValue;
      series.maxValue = maxValue;
    }
    
    // 레이아웃 고정 - 워드클라우드가 움직이지 않도록
    if (series.step !== undefined) {
      series.step = 0; // 레이아웃 단계 비활성화
    }
    if (series.angles !== undefined) {
      series.angles = [0]; // 회전 각도 고정 (0도만)
    }
    if (series.randomness !== undefined) {
      series.randomness = 0; // 랜덤성 제거
    }
    if (series.rotationThreshold !== undefined) {
      series.rotationThreshold = 0; // 회전 임계값 제거
    }
    
    // 레이아웃 알고리즘 완전 비활성화 (layout이 객체인 경우에만)
    if (series.layout && typeof series.layout === "object" && series.layout !== null) {
      if (series.layout.disabled !== undefined) {
        series.layout.disabled = true;
      }
    }
    
    // 레이아웃 업데이트 비활성화 (layoutAlgorithm이 객체인 경우에만)
    if (series.layoutAlgorithm && typeof series.layoutAlgorithm === "object" && series.layoutAlgorithm !== null) {
      if (series.layoutAlgorithm.disabled !== undefined) {
        series.layoutAlgorithm.disabled = true;
      }
    }
    
    // 애니메이션 완전 제거
    series.animationDuration = 0;
    if (series.animationOptions && typeof series.animationOptions === "object" && series.animationOptions !== null) {
      if (series.animationOptions.disabled !== undefined) {
        series.animationOptions.disabled = true;
      }
    }

    // Configure colors based on sentiment
    series.labels.template.adapter.add("fill", (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const sentiment = dataItem.dataContext.sentiment;
        if (sentiment === "POS") return am4core.color("#22C55E"); // green
        if (sentiment === "NEG") return am4core.color("#EF4444"); // red
        if (sentiment === "NEU") return am4core.color("#9CA3AF"); // gray
      }
      return fill;
    });

    // Handle click events
    series.labels.template.events.on("hit", (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const word = dataItem.dataContext.word;
        if (word) {
          setSelectedToken((prev) => (prev === word ? null : word));
        }
      }
    });

    // Handle hover effects
    series.labels.template.events.on("over", (ev) => {
      const label = ev.target;
      label.scale = 1.1;
    });

    series.labels.template.events.on("out", (ev) => {
      const label = ev.target;
      label.scale = 1;
    });

    // Set opacity for non-selected items
    series.labels.template.adapter.add("opacity", (opacity, target) => {
      const dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext && selectedToken) {
        const word = dataItem.dataContext.word;
        return word === selectedToken ? 1 : 0.3;
      }
      return 1;
    });

    // Tooltip
    series.labels.template.tooltipText = "{word}: {value}회 ({sentiment})";

    // Prepare data - value 기준 내림차순 정렬 (큰 값이 먼저)
    const chartData = wordCloudData
      .map((word) => ({
        word: word.text,
        value: word.value,
        sentiment: word.sentiment,
      }))
      .sort((a, b) => b.value - a.value); // value 큰 순서대로 정렬

    series.data = chartData;
    
    // 레이아웃이 완료된 후 완전히 고정
    series.events.on("ready", () => {
      // 레이아웃 완료 후 모든 애니메이션 및 업데이트 비활성화
      if (series.layout && typeof series.layout === "object" && series.layout !== null) {
        if (series.layout.disabled !== undefined) {
          series.layout.disabled = true;
        }
      }
      // 레이아웃 업데이트 중지
      if (chart.invalidateLayout && typeof chart.invalidateLayout === "function") {
        chart.invalidateLayout = () => {}; // 빈 함수로 대체
      }
      // 레이아웃 알고리즘 완전 중지
      if (series.layoutAlgorithm && typeof series.layoutAlgorithm === "object" && series.layoutAlgorithm !== null) {
        if (series.layoutAlgorithm.disabled !== undefined) {
          series.layoutAlgorithm.disabled = true;
        }
        if (typeof series.layoutAlgorithm.stop === "function") {
          series.layoutAlgorithm.stop();
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [wordCloudData, selectedToken, setSelectedToken]);

  return (
    <div className="h-[360px] w-full border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-inner overflow-hidden">
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default WordCloudComponent;

