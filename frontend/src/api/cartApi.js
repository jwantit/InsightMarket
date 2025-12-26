import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/cart`;

// 장바구니에 솔루션 추가 또는 수량 변경
export const addSolutionToCart = async (itemDTO) => {
  const res = await axios.post(`${host}/add`, itemDTO);
  return res.data;
};

// 장바구니 아이템 삭제
export const removeCartItem = async (cartItemid) => {
  const res = await axios.delete(`${host}/del/${cartItemid}`);
  return res.data;
};

// 프로젝트 ID에 해당하는 장바구니 아이템 목록 조회
export const getCartItems = async (projectid) => {
  const res = await axios.get(`${host}/item`, {
    params: {
      projectid,
    },
  });
  return res.data;
};
