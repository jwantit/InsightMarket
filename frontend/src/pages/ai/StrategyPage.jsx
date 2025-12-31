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

  const renderSection = (title, items) => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>

      {Array.isArray(items) && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-800 leading-relaxed"
            >
              {typeof it === "string" ? it : JSON.stringify(it)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">내용 없음</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 상단 헤더 / 액션 */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">전략 추천</h3>
          <p className="text-sm text-gray-600 mt-1">
            React → Spring → Python(RAG)로 인사이트 기반 솔루션 생성 로직 확인.
          </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !question?.trim()}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "분석 중..." : "추천 받기"}
        </button>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-4">
        <div className="grid gap-4 max-w-3xl">
          <label className="text-sm font-medium text-gray-700">
            질문 <span className="text-red-500">*</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="예) 가격이 비싸다는 불만이 많은데, 원인과 해결책을 제안해줘&#10;예) 최근 반응 기반으로 문제/해결책을 추천해줘"
            />
            {!question?.trim() && (
              <p className="mt-1 text-xs text-gray-500">질문을 입력해주세요.</p>
            )}
          </label>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              topK
              <input
                type="number"
                value={topK}
                min={1}
                max={5}
                onChange={(e) => setTopK(e.target.value)}
                className="ml-2 w-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <div className="text-xs text-gray-500">
              근거 검색 개수. 보통 3~5 권장.
            </div>
          </div>
        </div>

        {/* traceId / 상태 */}
        {traceId && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">traceId:</span>{" "}
            <span className="text-gray-600">{traceId}</span>
          </div>
        )}

        {loading && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-700">분석 중...</div>
            <div className="text-xs text-gray-500 mt-1">
              보통 1~3분 소요 예정.
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-700">에러</div>
            <div className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{error}</div>
          </div>
        )}
      </div>

      {/* 결과 영역 */}
      {result && (
        <div className="space-y-6">
          {/* 실패 */}
          {!ok && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-800">요청 실패</div>
              <div className="text-sm text-yellow-800 mt-1">
                {result?.reason || "unknown"}
              </div>
            </div>
          )}

          {/* 성공 */}
          {ok && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderSection("Insights", data?.insights)}
                {renderSection("Problems", data?.problems)}
                {renderSection("Actions", data?.actions)}
                {renderSection("Solutions", data?.solutions)}
              </div>

              {/* Sources */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">근거(Sources)</h4>

                {Array.isArray(sources) && sources.length > 0 ? (
                  <ul className="space-y-2">
                    {sources.map((s, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-700">
                          {s.title || s.url || `source-${idx}`}
                        </span>

                        {s.url && (
                          <button
                            onClick={() => window.open(s.url, "_blank")}
                            className="ml-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          >
                            열기
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">근거 없음</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StrategyPage;