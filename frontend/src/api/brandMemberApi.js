import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/brands`;

// 브랜드 멤버 목록
export const getBrandMembers = async (brandId) => {
  const res = await jwtAxios.get(`${host}/${brandId}/members`);
  return res.data;
};

// 브랜드 멤버 추가
// payload: { memberId, brandRole }
export const addBrandMember = async (brandId, payload) => {
  const res = await jwtAxios.post(`${host}/${brandId}/members`, payload);
  return res.data; // 서버가 void면 res.data는 undefined일 수 있음
};

// 브랜드 멤버 역할 변경
// payload: { brandRole }
export const updateBrandMemberRole = async (brandId, memberId, payload) => {
  const res = await jwtAxios.put(`${host}/${brandId}/members/${memberId}`, payload);
  return res.data;
};

// 브랜드 멤버 제거
export const removeBrandMember = async (brandId, memberId) => {
  const res = await jwtAxios.delete(`${host}/${brandId}/members/${memberId}`);
  return res.data;
};
