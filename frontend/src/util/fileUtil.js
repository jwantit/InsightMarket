import { API_SERVER_HOST } from "../api/memberApi";

/**
 * 파일 다운로드 함수
 * @param {number} fileId - 파일 ID
 */
export const downloadFile = (fileId) => {
  window.open(`${API_SERVER_HOST}/api/files/${fileId}`, "_blank");
};

