/**
 * 백엔드 ErrorResponse 형식:
 * {
 *   code: string,        // ErrorCode.name() (예: "BRAND_NOT_FOUND")
 *   message: string,     // ErrorCode.getMessage() (예: "브랜드를 찾을 수 없습니다.")
 *   timestamp: string    // LocalDateTime.now()
 * }
 */

/**
 * axios 에러에서 백엔드 ErrorResponse 메시지를 추출
 * @param {Error} error - axios 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} 에러 메시지
 */
export const getErrorMessage = (
  error,
  defaultMessage = "오류가 발생했습니다."
) => {
  if (!error) return defaultMessage;

  // 백엔드 ErrorResponse 형식
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // 일반 에러 메시지
  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * axios 에러에서 백엔드 ErrorResponse 코드를 추출
 * @param {Error} error - axios 에러 객체
 * @returns {string|null} 에러 코드
 */
export const getErrorCode = (error) => {
  if (!error) return null;
  return error.response?.data?.code || null;
};

/**
 * axios 에러에서 전체 ErrorResponse 객체 추출
 * @param {Error} error - axios 에러 객체
 * @returns {Object|null} ErrorResponse 객체 {code, message, timestamp} 또는 null
 */
export const getErrorResponse = (error) => {
  if (!error || !error.response?.data) return null;

  const data = error.response.data;

  // ErrorResponse 형식인지 확인 (code, message, timestamp 필드 존재)
  if (data.code || data.message) {
    return {
      code: data.code || null,
      message: data.message || null,
      timestamp: data.timestamp || null,
    };
  }

  return null;
};
