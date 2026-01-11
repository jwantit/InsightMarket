import React, { useMemo } from "react";
import ReactWordcloud from "react-wordcloud";
import { cx, sentimentColor, sentimentLabel, badgeStyle } from "../../../util/sentimentTrendUtil";

const WordCloudComponent = ({
  wordCloudData,
  wordCloudMeta,
  wordView,
  setWordView,
  activeSentiments,
  toggleSentiment,
  selectedToken,
  setSelectedToken,
  tokenStats,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">
            긍·부정 원인 키워드
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setWordView("cloud")}
              className={cx(
                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                wordView === "cloud"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              워드맵
            </button>
            <button
              onClick={() => setWordView("table")}
              className={cx(
                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                wordView === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
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
          const colorMap = {
            POS: {
              bg: "bg-blue-50",
              border: "border-blue-200",
              color: "text-blue-600",
              dot: "bg-blue-500",
            },
            NEG: {
              bg: "bg-red-50",
              border: "border-red-200",
              color: "text-red-600",
              dot: "bg-red-500",
            },
            NEU: {
              bg: "bg-gray-50",
              border: "border-gray-200",
              color: "text-gray-600",
              dot: "bg-gray-500",
            },
          };
          const colors = colorMap[s] || {
            bg: "bg-gray-50",
            border: "border-gray-200",
            color: "text-gray-600",
            dot: "bg-gray-500",
          };

          return (
            <button
              key={s}
              onClick={() => toggleSentiment(s)}
              className={cx(
                "px-2.5 py-1 rounded-lg border text-[10px] font-semibold flex items-center gap-1.5 transition-all",
                active
                  ? `${colors.bg} ${colors.border} ${colors.color}`
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              )}
              title={`${sentimentLabel(s)} 필터`}
            >
              <span
                className={cx(
                  "inline-block w-2 h-2 rounded-full",
                  active ? colors.dot : "bg-gray-300"
                )}
              />
              <span>{sentimentLabel(s)}</span>
            </button>
          );
        })}

        {selectedToken && (
          <button
            onClick={() => setSelectedToken(null)}
            className="ml-auto text-[10px] px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-all"
          >
            선택 해제
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[300px]">
        {!wordCloudData || wordCloudData.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-sm font-medium">표시할 키워드가 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">
              토큰 통계 데이터: {tokenStats?.length || 0}개 / 필터 조건을
              확인하세요.
            </p>
          </div>
        ) : wordView === "cloud" ? (
          <WordCloudChart
            wordCloudData={wordCloudData || []}
            activeSentiments={activeSentiments}
            selectedToken={selectedToken}
            setSelectedToken={setSelectedToken}
          />
        ) : (
          <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-lg bg-white">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                    단어
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">
                    감성
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-600 uppercase">
                    언급량
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(
                  (wordCloudData || []).filter((w) =>
                    activeSentiments.includes(w.sentiment)
                  ) || []
                ).map((w, idx) => {
                  const b = badgeStyle(w.sentiment);
                  const isSelected = selectedToken === w.text;
                  return (
                    <tr
                      key={`${w.text}-${idx}`}
                      className={cx(
                        "hover:bg-gray-50 transition-colors cursor-pointer",
                        isSelected ? "bg-blue-50" : ""
                      )}
                      onClick={() =>
                        setSelectedToken((prev) =>
                          prev === w.text ? null : w.text
                        )
                      }
                    >
                      <td className="px-3 py-2 font-medium text-gray-900">
                        {w.text}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ background: b.bg, color: b.text }}
                        >
                          {sentimentLabel(w.sentiment)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-gray-700">
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
    </div>
  );
};

// react-wordcloud Chart Component
const WordCloudChart = ({
  wordCloudData,
  activeSentiments,
  selectedToken,
  setSelectedToken,
}) => {
  // activeSentiments에 따라 필터링된 데이터
  const filteredData = useMemo(() => {
    return wordCloudData.filter((w) => activeSentiments.includes(w.sentiment));
  }, [wordCloudData, activeSentiments]);

  // react-wordcloud에 맞는 데이터 형식으로 변환
  const words = useMemo(() => {
    return filteredData.map((w) => ({
      text: w.text,
      value: w.value,
      polarity: w.sentiment, // react-wordcloud의 getWordColor에서 사용
    }));
  }, [filteredData]);

  // 워드클라우드 옵션 설정 (대시보드와 동일한 스타일)
  const options = {
    fontFamily:
      "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
    fontWeight: "700",
    fontSizes: [18, 72],
    padding: 3,
    rotations: 2,
    rotationAngles: [0, 0],
    deterministic: true,
    spiral: "archimedean",
    scale: "sqrt",
    enableTooltip: true,
    transitionDuration: 1000,
  };

  // 색상 콜백 (대시보드와 동일)
  const callbacks = {
    getWordColor: (word) => {
      if (word.polarity === "POS") return "#3B82F6"; // 긍정: 파랑
      if (word.polarity === "NEG") return "#EF4444"; // 부정: 빨강
      return "#94A3B8"; // 중립: 회색
    },
    getWordTooltip: (word) => `${word.text}: ${word.value}회`,
    onWordClick: (word) => {
      setSelectedToken((prev) => (prev === word.text ? null : word.text));
    },
  };

  if (!words || words.length === 0) {
    return (
      <div className="h-[360px] w-full border border-gray-200 rounded-xl bg-white flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm font-medium">표시할 키워드가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">
            선택한 감성에 해당하는 키워드가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full border border-gray-200 rounded-xl bg-white overflow-hidden">
      <ReactWordcloud words={words} options={options} callbacks={callbacks} />
    </div>
  );
};

export default WordCloudComponent;
