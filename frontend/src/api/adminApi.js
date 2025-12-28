import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/admin`;

/* =========================
   가입 승인
========================= */

// 승인 대기 목록
export const getPendingApprovals = async () => {
  const res = await jwtAxios.get(`${host}/approvals`);
  return res.data;
};

// 가입 승인
export const approveMember = async (memberId) => {
  const res = await jwtAxios.post(`${host}/approvals/${memberId}`);
  return res.data;
};

/* =========================
   사용자 계정 관리
========================= */

// 회사 멤버 목록 조회 (+ 검색)
export const getAdminMembers = async (params = {}) => {
  // params: { keyword, expired, role }
  const res = await jwtAxios.get(`${host}/members`, { params });
  return res.data;
};

// 시스템 권한 변경 (USER / COMPANY_ADMIN)
export const updateMemberRole = async (memberId, role) => {
  const res = await jwtAxios.put(
    `${host}/members/${memberId}/role`,
    { role }
  );
  return res.data;
};

// 탈퇴 / 복구 처리 (expired)
export const updateMemberExpired = async (memberId, expired) => {
  const res = await jwtAxios.put(
    `${host}/members/${memberId}/expire`,
    { expired }
  );
  return res.data;
};
