// src/pages/ai/AiQuickTestPage.jsx
// ✅ 기능: 입력값으로 /api/ai/ask 호출하고 JSON 그대로 화면 출력(useState)
// ✅ 디버깅용 로그 포함

import React, { useState } from "react";
import { askAiInsight } from "../../api/insightAiApi";

export default function AiQuickTestPage() {
  const [brandId, setBrandId] = useState(1);
  const [topK, setTopK] = useState(5);
  const [question, setQuestion] = useState("최근 반응 요약해줘");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [traceId, setTraceId] = useState(null);
  const [result, setResult] = useState(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("[AiQuickTestPage] submit");
      const res = await askAiInsight({
        brandId: Number(brandId),
        question,
        topK: Number(topK),
      });

      setTraceId(res.traceId || null);
      setResult(res.data);
    } catch (e) {
      console.log("[AiQuickTestPage] error", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>AI 연결 테스트 (React → Spring → Python)</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <label>
          brandId
          <input
            type="number"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          topK
          <input
            type="number"
            value={topK}
            onChange={(e) => setTopK(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          question
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button onClick={onSubmit} disabled={loading} style={{ padding: 10 }}>
          {loading ? "요청 중..." : "요청 보내기"}
        </button>

        {traceId && (
          <div>
            <b>traceId:</b> {traceId}
          </div>
        )}

        {error && (
          <div style={{ whiteSpace: "pre-wrap" }}>
            <b>error:</b> {error}
          </div>
        )}

        {result && (
          <pre style={{ background: "#111", color: "#0f0", padding: 12, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
