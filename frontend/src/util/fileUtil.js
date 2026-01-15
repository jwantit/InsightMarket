import { API_SERVER_HOST } from "../api/memberApi";

/**
 * 파일 다운로드 함수
 * @param {number} fileId - 파일 ID
 */
export const downloadFile = (fileId) => {
  window.open(`${API_SERVER_HOST}/api/files/${fileId}`, "_blank");
};

/**
 * 파일 URL 가져오기
 * @param {number} fileId - 파일 ID
 * @returns {string|null} 파일 URL
 */
export const getFileUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_SERVER_HOST}/api/files/${fileId}`;
};

/**
 * 썸네일 URL 가져오기
 * @param {number} fileId - 파일 ID
 * @returns {string|null} 썸네일 URL
 */
export const getThumbnailUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_SERVER_HOST}/api/files/${fileId}/thumbnail`;
};

