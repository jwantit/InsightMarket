// src/api/snsApi.js
// SNS 분석 데이터 조회 API 클라이언트
import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

jwtAxios.defaults.baseURL = API_SERVER_HOST;

/**
 * 최근 인사이트 조회
 * @param {number} brandId - 브랜드 ID
 * @param {number|null} projectId - 프로젝트 ID (선택)
 * @param {number|null} keywordId - 키워드 ID (선택)
 * @param {string|null} source - 소스 (선택: NAVER, YOUTUBE 등)
 * @returns {Promise<Array>} 인사이트 목록
 */
export async function getInsights(
  brandId,
  projectId = null,
  keywordId = null,
  source = null
) {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (keywordId) params.append("keywordId", keywordId);
  if (source) params.append("source", source);

  const res = await jwtAxios.get(
    `/api/${brandId}/sns/insights?${params.toString()}`
  );

  return res.data;
}

/**
 * 일일 언급량 통계 조회
 * @param {number} brandId - 브랜드 ID
 * @param {number|null} projectId - 프로젝트 ID (선택)
 * @param {number|null} keywordId - 키워드 ID (선택)
 * @param {string|null} source - 소스 (선택)
 * @param {string|null} startDate - 시작 날짜 (YYYY-MM-DD 형식, 선택)
 * @param {string|null} endDate - 종료 날짜 (YYYY-MM-DD 형식, 선택)
 * @returns {Promise<Array>} 일일 통계 목록
 */
export async function getDailyStats(
  brandId,
  projectId = null,
  keywordId = null,
  competitorId = null,
  source = null,
  startDate = null,
  endDate = null
) {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (keywordId) params.append("keywordId", keywordId);
  if (competitorId) params.append("competitorId", competitorId);
  if (source) params.append("source", source);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await jwtAxios.get(
    `/api/${brandId}/sns/daily-stats?${params.toString()}`
  );

  return res.data;
}

/**
 * 감성 통계 조회
 * @param {number} brandId - 브랜드 ID
 * @param {number|null} projectId - 프로젝트 ID (선택)
 * @param {number|null} keywordId - 키워드 ID (선택)
 * @param {string|null} source - 소스 (선택)
 * @param {string|null} startDate - 시작 날짜 (YYYY-MM-DD 형식, 선택)
 * @param {string|null} endDate - 종료 날짜 (YYYY-MM-DD 형식, 선택)
 * @returns {Promise<Array>} 감성 통계 목록
 */
export async function getSentimentStats(
  brandId,
  projectId = null,
  keywordId = null,
  competitorId = null,
  source = null,
  startDate = null,
  endDate = null
) {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (keywordId) params.append("keywordId", keywordId);
  if (competitorId) params.append("competitorId", competitorId);
  if (source) params.append("source", source);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await jwtAxios.get(
    `/api/${brandId}/sns/sentiment-stats?${params.toString()}`
  );

  return res.data;
}

/**
 * 프로젝트 목록 조회
 * @param {number} brandId - 브랜드 ID
 * @returns {Promise<Array>} 프로젝트 목록
 */
export async function getProjects(brandId) {
  const res = await jwtAxios.get(`/api/${brandId}/sns/projects`);
  return res.data;
}

/**
 * 프로젝트의 키워드 목록 조회
 * @param {number} brandId - 브랜드 ID
 * @param {number} projectId - 프로젝트 ID
 * @returns {Promise<Array>} 키워드 목록
 */
export async function getProjectKeywords(brandId, projectId) {
  const res = await jwtAxios.get(
    `/api/${brandId}/sns/projects/${projectId}/keywords`
  );
  return res.data;
}

/**
 * 토큰 통계 조회 (워드클라우드용)
 * @param {number} brandId - 브랜드 ID
 * @param {number|null} projectId - 프로젝트 ID (선택)
 * @param {number|null} keywordId - 키워드 ID (선택)
 * @param {string|null} source - 소스 (선택)
 * @param {string|null} startDate - 시작 날짜 (YYYY-MM-DD 형식, 선택)
 * @param {string|null} endDate - 종료 날짜 (YYYY-MM-DD 형식, 선택)
 * @returns {Promise<Array>} 토큰 통계 목록
 */
export async function getTokenStats(
  brandId,
  projectId = null,
  keywordId = null,
  competitorId = null,
  source = null,
  startDate = null,
  endDate = null
) {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  if (keywordId) params.append("keywordId", keywordId);
  if (competitorId) params.append("competitorId", competitorId);
  if (source) params.append("source", source);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await jwtAxios.get(
    `/api/${brandId}/sns/token-stats?${params.toString()}`
  );

  return res.data;
}

/**
 * 경쟁사 목록 조회
 * @param {number} brandId - 브랜드 ID
 * @returns {Promise<Array>} 경쟁사 목록
 */
export async function getCompetitors(brandId) {
  const res = await jwtAxios.get(`/api/${brandId}/sns/competitors`);
  return res.data;
}
