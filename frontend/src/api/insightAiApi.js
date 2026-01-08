// src/api/insightAiApi.js
// ✅ 기능: Spring(/api/ai/ask) 호출 래퍼
// ✅ 디버깅용 로그 포함
import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

// jwtAxios에 baseURL과 timeout 설정
jwtAxios.defaults.baseURL = API_SERVER_HOST;
jwtAxios.defaults.timeout = 700000;

export async function askAiInsight({
  brandId,
  projectId,
  question,
  topK = 3,
  traceId,
} = {}) {
  console.log("[askAiInsight] request", {
    brandId,
    projectId,
    topK,
    questionLen: question?.length,
  });

  const res = await jwtAxios.post(
    `/api/${Number(brandId)}/ai/ask`,
    { projectId, question, topK },
    { headers: traceId ? { "X-Trace-Id": traceId } : {} }
  );

  console.log("[askAiInsight] response status", res.status);
  console.log(
    "[askAiInsight] response traceId header",
    res.headers?.["x-trace-id"]
  );

  return { data: res.data, traceId: res.headers?.["x-trace-id"] };
}

export async function generateSolutionReport({
  brandId,
  projectId,
  projectName,
  question,
  solutionTitle,
  solutionDescription,
  relatedProblems = [],
  relatedInsights = [],
  keywordStatsSummary = "",
  reportType = "marketing",
  traceId,
} = {}) {
  console.log("[generateSolutionReport] request", {
    brandId,
    projectId,
    solutionTitle,
    reportType,
  });

  const res = await jwtAxios.post(
    `/api/${Number(brandId)}/ai/generate-solution-report`,
    {
      brandId: Number(brandId),
      brandName: "", // TODO: 브랜드명 조회 필요
      projectId: Number(projectId),
      projectName: projectName || "",
      question,
      solutionTitle,
      solutionDescription: solutionDescription || "",
      relatedProblems,
      relatedInsights,
      keywordStatsSummary,
      reportType,
    },
    { headers: traceId ? { "X-Trace-Id": traceId } : {} }
  );

  console.log("[generateSolutionReport] response status", res.status);
  return { data: res.data, traceId: res.headers?.["x-trace-id"] };
}

export async function saveReportAsSolution({
  brandId,
  projectId,
  solutionTitle,
  reportContent,
  reportType = "marketing",
  traceId,
} = {}) {
  console.log("[saveReportAsSolution] request", {
    brandId,
    projectId,
    solutionTitle,
  });

  const res = await jwtAxios.post(
    `/api/${Number(brandId)}/ai/save-report`,
    {
      projectId: Number(projectId),
      solutionTitle,
      reportContent,
      reportType,
    },
    { headers: traceId ? { "X-Trace-Id": traceId } : {} }
  );

  console.log("[saveReportAsSolution] response status", res.status);
  return { data: res.data, traceId: res.headers?.["x-trace-id"] };
}

export async function getFreeReportCount(brandId) {
  console.log("[getFreeReportCount] request", { brandId });

  const res = await jwtAxios.get(
    `/api/${Number(brandId)}/ai/free-report-count`
  );

  console.log(
    "[getFreeReportCount] response status",
    res.status,
    "count",
    res.data
  );
  return res.data; // Long 타입으로 반환
}

export async function analyzeImageContent({
  brandId,
  imageFile,
  provider = "ollama",
  traceId,
} = {}) {
  console.log("[analyzeImageContent] request", {
    brandId,
    imageSize: imageFile?.size,
    imageType: imageFile?.type,
    provider,
  });

  // FormData 생성
  const formData = new FormData();
  formData.append("image", imageFile);
  if (provider) {
    formData.append("provider", provider);
  }

  const headers = {
    "Content-Type": "multipart/form-data",
  };
  if (traceId) {
    headers["X-Trace-Id"] = traceId;
  }

  const res = await jwtAxios.post(
    `/api/${Number(brandId)}/ai/image/analyze`,
    formData,
    { headers }
  );

  console.log("[analyzeImageContent] response status", res.status);
  console.log(
    "[analyzeImageContent] response traceId header",
    res.headers?.["x-trace-id"]
  );

  return {
    data: res.data,
    traceId: res.headers?.["x-trace-id"] || traceId,
  };
}