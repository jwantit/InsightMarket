import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/brands`;

// 브랜드 생성
export const createBrand = async (data) => {
  const res = await jwtAxios.post(`${host}`, data);
  return res.data;
};

// 내 브랜드 목록
export const getBrandList = async () => {
  const res = await jwtAxios.get(`${host}`); 
  return res.data;
};

// 브랜드 상세
export const getBrandDetail = async (brandId) => {
  const res = await jwtAxios.get(`${host}/${brandId}`); 
  return res.data;
};

// 브랜드 수정
export const updateBrand = async (brandId, data) => {
  await jwtAxios.put(`${host}/${brandId}`, data);
};

// 브랜드 삭제
export const deleteBrand = async (brandId) => {
  await jwtAxios.delete(`${host}/${brandId}`);
};
