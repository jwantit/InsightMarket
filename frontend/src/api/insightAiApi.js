// src/api/insightAiApi.js
// ✅ 기능: Spring(/api/ai/ask) 호출 래퍼
// ✅ 디버깅용 로그 포함
import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";

const client = axios.create({
    baseURL: API_SERVER_HOST,
    timeout: 700000,
  });

export async function askAiInsight({ brandId, question, topK = 5, traceId } = {}) {
  console.log("[askAiInsight] request", { brandId, topK, questionLen: question?.length });

  const res = await client.post(
    `/api/${Number(brandId)}/ai/ask`,
    { question, topK },
    {headers: traceId ? { "X-Trace-Id": traceId } : {}}
  );

  console.log("[askAiInsight] response status", res.status);
  console.log("[askAiInsight] response traceId header", res.headers?.["x-trace-id"]);

  return {data: res.data, traceId: res.headers?.["x-trace-id"]};
}
