import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";

const host = `${API_SERVER_HOST}/api/solution`;

export const getList = async ({ page, size, projectid }) => {
  const res = await axios.get(`${host}/list`, {
    params: {
      page,
      size,
      projectid,
    },
  });

  return res.data;
};


