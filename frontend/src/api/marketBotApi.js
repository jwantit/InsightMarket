// src/api/marketBotApi.js
// ✅ 기능: 상권 분석 API 호출 래퍼
import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

// jwtAxios에 baseURL과 timeout 설정
jwtAxios.defaults.baseURL = API_SERVER_HOST;
jwtAxios.defaults.timeout = 300000; // 5분

/**
 * 상권 분석 요청 (Best/Worst 매장 비교)
 * @param {Object} params - 분석 요청 파라미터
 * @param {string} params.category - 카테고리 (카페, 음식점, 편의점)
 * @param {number} params.latitude - 위도
 * @param {number} params.longitude - 경도
 * @param {number} params.radius - 반경 (미터)
 * @param {string} params.address - 주소 텍스트
 * @returns {Promise} 분석 결과 (LocationComparisonResponseDTO)
 */
export async function requestMarketBot(params) {
  console.log("[requestMarketBot] request", params);

  // 백엔드 LocationRequestDTO 형식에 맞게 파라미터 변환
  const requestParams = {
    category: params.category,
    latitude: params.latitude,
    longitude: params.longitude,
    radius: params.radius,
    address: params.address,
  };

  const res = await jwtAxios.get(`/api/location/best_worst`, {
    params: requestParams,
  });

  console.log("[requestMarketBot] response status", res.status);
  console.log("[requestMarketBot] response data", res.data);

  return res.data;
}

/**
 * 매장 상세 데이터 조회 (Insight)
 * @param {string} placeId - 매장 ID (예: "kakao:111")
 * @returns {Promise} 상세 데이터 (LocationInsightResponseDTO)
 */
export async function getPlaceDetail(placeId) {
  console.log("[getPlaceDetail] request", placeId);

  // 백엔드 LocationRequestDTO 형식에 맞게 파라미터 구성
  const requestParams = {
    placeId: placeId, // placeId만 전달하면 loadFromJson()에서 해당 ID로 필터링
  };

  const res = await jwtAxios.get(`/api/location/Insight`, {
    params: requestParams,
  });

  console.log("[getPlaceDetail] response status", res.status);
  console.log("[getPlaceDetail] response data", res.data);

  return res.data;
}

/**
 * 과포화도 레벨에 따른 색상 클래스 반환
 * @param {string} level - 과포화도 레벨 (risk, warning, safe)
 * @returns {string} Tailwind CSS 클래스
 */
export function getSaturationColor(level) {
  if (level === "risk") return "text-red-600 bg-red-100 border-red-300";
  if (level === "warning")
    return "text-yellow-600 bg-yellow-100 border-yellow-300";
  return "text-green-600 bg-green-100 border-green-300";
}

/**
 * 창업 가이드 요청 (LLM)
 * @param {Object} resultData - 분석 결과 데이터 (bestPlaceId, worstPlaceId, radius 등)
 * @returns {Promise} 가이드 데이터 { summary, consulting }
 */
export async function requestMarketBotGuide(resultData) {
  console.log("[requestMarketBotGuide] request", resultData);

  const requestParams = {
    placeId: resultData.bestPlaceId, // bestPlaceId → placeId로 변경
    worstPlaceId: resultData.worstPlaceId,
    radius: resultData.radius || resultData.redis,
  };

  const res = await jwtAxios.get(`/api/location/llm`, {
    params: requestParams,
  });

  console.log("[requestMarketBotGuide] response status", res.status);
  console.log("[requestMarketBotGuide] response data", res.data);

  return res.data;
}

/**
 * 에러 메시지 추출 (API 에러 또는 기본 메시지)
 * @param {Error} err - 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 에러 메시지
 */
export function getErrorMessage(err, defaultMessage = "오류가 발생했습니다.") {
  return err?.response?.data?.message || defaultMessage;
}
