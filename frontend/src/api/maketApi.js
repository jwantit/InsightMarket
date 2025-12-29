import axios from "axios";
import { API_SERVER_HOST } from "./memberApi";
import jwtAxios from "../util/jwtUtil";

const host = `${API_SERVER_HOST}/api/solution`;

export const getList = async ({ page, size, projectid }) => {
  const res = await jwtAxios.get(`${host}/list`, {
    params: {
      page,
      size,
      projectid,
    },
  });

  return res.data;
};


