import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";
import jwtAxios from "../util/jwtUtil";


const host = `${API_SERVER_HOST}/api/solution`;

export const getProjectsByTenant = async (brandId) => {
  const res = await jwtAxios.get(`${host}/brand/${brandId}`, {
  });

  return res.data;
};

export const getLatestStrategyByProject = async (projectid) => {
    const res = await jwtAxios.get(`${host}/latest/strategy/${projectid}`);

    return res.data;
}