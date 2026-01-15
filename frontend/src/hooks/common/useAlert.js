import { showConfirm, showAlert } from "../../components/common/AlertContainer";

/**
 * 확인/취소가 있는 Alert를 표시합니다.
 * @param {string} message - 표시할 메시지
 * @returns {Promise<boolean>} 확인(true) 또는 취소(false)
 * 
 * @example
 * const confirmed = await confirmAlert("정말 삭제하시겠습니까?");
 * if (confirmed) {
 *   // 삭제 실행
 * }
 */
export const confirmAlert = showConfirm;

/**
 * 확인 버튼만 있는 Alert를 표시합니다.
 * @param {string} message - 표시할 메시지
 * @param {string} variant - Alert 타입: "success" | "error" | "warning" | "info" (기본값: "info")
 * @returns {Promise<void>} 확인 버튼 클릭 시 resolve
 * 
 * @example
 * await showAlert("저장되었습니다.", "success");
 * await showAlert("오류가 발생했습니다.", "error");
 * await showAlert("알림 메시지입니다.", "info");
 */
export { showAlert };

export default confirmAlert;

