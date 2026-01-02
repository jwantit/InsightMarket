// src/pages/ai/StrategyPage.jsx
// ============================================================
// [기능] 인사이트 기반 전략/솔루션 추천 페이지
// - React → Spring(/api/{brandId}/ai/ask) 호출
// - ok=true/false 분기 렌더링
// - traceId 표시
// ============================================================

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { askAiInsight } from "../../api/insightAiApi";
import { getErrorMessage } from "../../util/errorUtil";

const StrategyPage = () => {
  const { brandId } = useParams();

  const [topK, setTopK] = useState(3);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [traceId, setTraceId] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setTraceId(null);

    try {
      console.log("[StrategyPage] submit", { brandId, topK, questionLen: question?.length });

      const res = await askAiInsight({
        brandId: Number(brandId),
        question,
        topK: Number(topK),
      });

      setTraceId(res.traceId || null);
      setResult(res.data || null);
    } catch (e) {
      console.log("[StrategyPage] error", e);

      // Spring ErrorResponse 포맷 우선 처리 (code, message, timestamp)
      // 없으면 Python 응답의 reason 필드, 그 외 일반 에러 메시지
      const msg =
        getErrorMessage(e, null) ||
        e?.response?.data?.reason ||
        e?.response?.data?.detail ||
        "요청 처리 중 오류가 발생했습니다.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const ok = result?.ok === true;
  const data = result?.data || null;
  const sources = result?.sources || [];

  const getSectionColor = (title) => {
    if (title === "Insights") return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "💡" };
    if (title === "Problems") return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "⚠️" };
    if (title === "Solutions") return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "✅" };
    return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "" };
  };

  const renderSection = (title, items) => {
    const colors = getSectionColor(title);
    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className={`px-5 py-4 border-b ${colors.border} ${colors.bg}`}>
          <h4 className={`text-sm font-bold ${colors.text} flex items-center gap-2`}>
            {colors.icon && <span>{colors.icon}</span>}
            {title}
          </h4>
        </div>
        <div className="p-5">
          {Array.isArray(items) && items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((it, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all text-sm text-gray-800 leading-relaxed"
                >
                  {typeof it === "string" ? it : JSON.stringify(it)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center">내용 없음</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 헤더 / 액션 */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="px-6 py-5 border-b flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">전략 추천</h2>
            <p className="text-sm text-gray-600 mt-2">
              브랜드 데이터를 분석하여 인사이트, 문제점, 솔루션을 추천합니다.
            </p>
          </div>
          <button
            onClick={onSubmit}
            disabled={loading || !question?.trim()}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shrink-0
              ${loading || !question?.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
              }`}
          >
            {loading ? "분석 중..." : "추천 받기"}
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              질문 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
              placeholder="예) 가격이 비싸다는 불만이 많은데, 원인과 해결책을 제안해줘&#10;예) 최근 반응 기반으로 문제/해결책을 추천해줘"
            />
            {!question?.trim() && (
              <p className="mt-2 text-xs text-gray-500">질문을 입력해주세요.</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span>검색 개수</span>
              <input
                type="number"
                value={topK}
                min={1}
                max={5}
                onChange={(e) => setTopK(e.target.value)}
                className="w-20 p-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </label>
            <div className="text-xs text-gray-500">
              템플릿 매칭 개수 (권장: 3~5)
            </div>
          </div>
        </div>
      </div>

      {/* traceId / 상태 */}
      {traceId && (
        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">traceId:</span> {traceId}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">분석 중...</div>
              <div className="text-xs text-gray-500 mt-1">
                보통 1~3분 소요 예정
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-lg">⚠️</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-700 mb-1">오류 발생</div>
              <div className="text-sm text-red-700 whitespace-pre-wrap">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      {result && (
        <div className="space-y-6">
          {/* 실패 */}
          {!ok && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">요청 실패</div>
                  <div className="text-sm text-yellow-800">
                    {result?.reason || "알 수 없는 오류가 발생했습니다."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 성공 */}
          {ok && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {renderSection("Insights", data?.insights)}
                {renderSection("Problems", data?.problems)}
                {renderSection("Solutions", data?.solutions)}
              </div>

              {/* Sources */}
              <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-gray-50">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>📎</span>
                    근거 (Sources)
                  </h4>
                </div>
                <div className="p-5">
                  {Array.isArray(sources) && sources.length > 0 ? (
                    <div className="space-y-3">
                      {sources.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {s.title || s.url || `근거 ${idx + 1}`}
                            </div>
                            {s.source && (
                              <div className="text-xs text-gray-500 mt-1">
                                {s.source}
                              </div>
                            )}
                          </div>
                          {s.url && (
                            <button
                              onClick={() => window.open(s.url, "_blank")}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors shrink-0"
                            >
                              열기
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">근거 없음</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategyPage;