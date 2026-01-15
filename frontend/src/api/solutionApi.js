import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";
import jwtAxios from "../util/jwtUtil";

const host = `${API_SERVER_HOST}/api/solution`;

//NEW전략
export const getLatestStrategyByProject = async (projectid) => {
  const res = await jwtAxios.get(`${host}/latest/strategy/${projectid}`);

  return res.data;
};
//전체보기
export const getAllSolutionByProject = async (page, size, projectid) => {
  const res = await jwtAxios.get(`${host}/list`, {
    params: {
      page,
      size,
      projectid,
    },
  });

  return res.data;
};
//삭제
export const removeSolution = async (solutionid) => {
  const res = await jwtAxios.delete(`${host}/delete/${solutionid}`);

  return res.data;
};

//구매한 솔루션 상세 조회
export const getPurchasedSolutionDetail = async (solutionId) => {
  const res = await jwtAxios.get(`${host}/purchased/${solutionId}`);
  return res.data;
};
