import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";


const host = `${API_SERVER_HOST}/api/solution`;

export const getProjectsByTenant = async (tenantId) => {
  const res = await axios.get(`${host}/brand/${tenantId}`, {
  });

  return res.data;
};

export const getLatestStrategyByProject = async (projectid) => {
    const res = await axios.get(`${host}/latest/strategy/${projectid}`);

    return res.data;
}