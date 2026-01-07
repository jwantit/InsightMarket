// src/api/marketBotApi.js
// ✅ 기능: 상권 분석 API 호출 래퍼
import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

// jwtAxios에 baseURL과 timeout 설정
jwtAxios.defaults.baseURL = API_SERVER_HOST;
jwtAxios.defaults.timeout = 300000; // 5분

/**
 * 상권 분석 요청
 * @param {Object} params - 분석 요청 파라미터
 * @param {string} params.category - 카테고리 (cafe, restaurant 등)
 * @param {number} params.latitude - 위도
 * @param {number} params.longitude - 경도
 * @param {number} params.redis - 반경 (미터)
 * @param {string} params.address - 주소 텍스트
 * @returns {Promise} 분석 결과
 */
export async function requestMarketBot(params) {
  console.log("[requestMarketBot] request", params);

  const res = await jwtAxios.post(
    `/api/market-bot/request`,
    params,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("[requestMarketBot] response status", res.status);
  console.log("[requestMarketBot] response data", res.data);

  return res.data;
}

/**
 * 매장 상세 데이터 조회
 * @param {string} placeId - 매장 ID (예: "kakao:111")
 * @returns {Promise} 상세 데이터
 */
export async function getPlaceDetail(placeId) {
  console.log("[getPlaceDetail] request", placeId);

  const res = await jwtAxios.get(`/api/market-bot/place/${placeId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("[getPlaceDetail] response status", res.status);
  console.log("[getPlaceDetail] response data", res.data);

  return res.data;
}

/**
 * 모의 분석 결과 데이터 (API 연결 전까지 사용)
 * @param {number} radius - 분석 반경
 * @returns {Object} 모의 결과 데이터
 */
export function getMockAnalysisResult(radius) {
  return {
    redis: radius,
    foundCount: 3,
    bestPlaceId: "kakao:111",
    worstPlaceId: "kakao:333",
    places: [
      {
        rank: "Best",
        placeId: "kakao:111",
        placeName: "스타벅스 강남점",
        salesIndex: 98,
        desc: "오피스 밀집",
      },
      {
        rank: "Worst",
        placeId: "kakao:333",
        placeName: "스타벅스 역삼2점",
        salesIndex: 42,
        desc: "이면도로 위치",
      },
    ],
  };
}

/**
 * 모의 상세 데이터 (API 연결 전까지 사용)
 * @param {string} placeId - 매장 ID
 * @param {string} placeName - 매장명
 * @returns {Object} 모의 상세 데이터
 */
export function getMockPlaceDetail(placeId, placeName) {
  const mockDataMap = {
    "kakao:111": {
      placeId: "kakao:111",
      placeName: "스타벅스 강남점",
      trafficPeak: { start: "12:00", end: "13:30" },
      mainAgeGroup: { label: "30대", ratio: 0.42 },
      saturation: { level: "risk", label: "위험" },
      trafficSeries: [
        { label: "오전", value: 35 },
        { label: "점심", value: 85 },
        { label: "오후", value: 55 },
        { label: "저녁", value: 40 },
      ],
    },
    "kakao:333": {
      placeId: "kakao:333",
      placeName: "스타벅스 역삼2점",
      trafficPeak: { start: "12:00", end: "13:30" },
      mainAgeGroup: { label: "30대", ratio: 0.42 },
      saturation: { level: "safe", label: "안전" },
      trafficSeries: [
        { label: "오전", value: 20 },
        { label: "점심", value: 40 },
        { label: "오후", value: 60 },
        { label: "저녁", value: 75 },
      ],
    },
  };

  return (
    mockDataMap[placeId] || {
      placeId: placeId,
      placeName: placeName || "매장",
      trafficPeak: { start: "12:00", end: "13:30" },
      mainAgeGroup: { label: "30대", ratio: 0.42 },
      saturation: { level: "risk", label: "위험" },
      trafficSeries: [
        { label: "오전", value: 35 },
        { label: "점심", value: 85 },
        { label: "오후", value: 55 },
        { label: "저녁", value: 40 },
      ],
    }
  );
}

/**
 * 과포화도 레벨에 따른 색상 클래스 반환
 * @param {string} level - 과포화도 레벨 (risk, warning, safe)
 * @returns {string} Tailwind CSS 클래스
 */
export function getSaturationColor(level) {
  if (level === "risk") return "text-red-600 bg-red-100 border-red-300";
  if (level === "warning") return "text-yellow-600 bg-yellow-100 border-yellow-300";
  return "text-green-600 bg-green-100 border-green-300";
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

