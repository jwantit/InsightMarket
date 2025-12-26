import axios from "axios";
import jwtAxios from "../util/jwtUtil";

//서버 주소
export const API_SERVER_HOST = "http://localhost:8080";

const host = `${API_SERVER_HOST}/member`;

//로그인
export const loginPost = async (loginParam) => {
  const header = { headers: { "Content-Type": "x-www-form-urlencoded" } };

  const form = new FormData();
  form.append("username", loginParam.email);
  form.append("password", loginParam.pw);

  const res = await axios.post(`${host}/login`, form, header);

  return res.data;
};

//회원 수정
export const modifyMember = async (member) => {
  const res = await jwtAxios.put(`${host}/modify`, member);

  return res.data;
};

//회원 가입
export const joinMember = async (joinParam) => {
  const res = await axios.post(`${host}/join`, joinParam);
  return res.data;
};

//회사 목록 조회
export const getCompanies = async () => {
  const res = await axios.get(`${API_SERVER_HOST}/api/company`);
  return res.data;
};

//승인 대기 회원 조회
export const getPendingMembers = async () => {
  const res = await jwtAxios.get(`${host}/pending`);
  return res.data;
};

//승인 버튼 클릭 시
export const approveMember = async (memberId) => {
  const res = await jwtAxios.post(`${host}/approve`, { memberId: memberId });
  return res.data;
};
