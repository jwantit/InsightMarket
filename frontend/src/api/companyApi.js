import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/company`;

//회사 목록 조회
export const getCompanies = async () => {
  const res = await axios.get(`${host}/list`);
  return res.data;
};
