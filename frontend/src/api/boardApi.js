import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";
import buildMultipart from "../util/buildMultipart";

const host = `${API_SERVER_HOST}/api/brands`;

// 게시글 목록
export const getBoardList = async ({ brandId, page = 1, size = 10 }) => {
    const res = await jwtAxios.get(`${host}/${brandId}/boards`, {
        params: { page, size },
      });
      return res.data;
    };

    // 게시글 상세
export const getBoardDetail = async ({ brandId, boardId }) => {
    const res = await jwtAxios.get(`${host}/${brandId}/boards/${boardId}`);
      return res.data;
    };

    // 게시글 등록 (multipart: data + files)
    export const createBoard = async ({ brandId, data, files }) => {
      const formData = buildMultipart(data, files);
      const res = await jwtAxios.post(`${host}/${brandId}/boards`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    };

    // 게시글 수정 (multipart + keepFileIds 포함)
    export const updateBoard = async ({ brandId, boardId, data, files }) => {
      const formData = buildMultipart(data, files);
      const res = await jwtAxios.put(
        `${host}/${brandId}/boards/${boardId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    };

    // 게시글 삭제(soft delete)
export const deleteBoard = async ({ brandId, boardId }) => {
    const res = await jwtAxios.delete(`${host}/${brandId}/boards/${boardId}`);
      return res.data;
    };