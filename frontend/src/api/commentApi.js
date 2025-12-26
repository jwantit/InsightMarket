import jwtAxios from "../util/jwtUtil";
import { API_SERVER_HOST } from "./memberApi";
import buildMultipart from "../util/buildMultipart";

const host = `${API_SERVER_HOST}/api/brands`;

// 댓글 트리 조회
export const getCommentTree = async ({ brandId, boardId }) => {
  const res = await jwtAxios.get(
    `${host}/${brandId}/boards/${boardId}/comments`
  );
  return res.data;
};

// 댓글/대댓글 생성
export const createComment = async ({ brandId, boardId, data, files }) => {
  const formData = buildMultipart(data, files);
  const res = await jwtAxios.post(
    `${host}/${brandId}/boards/${boardId}/comments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

// 댓글/대댓글 수정
export const updateComment = async ({
  brandId,
  boardId,
  commentId,
  data,
  files,
}) => {
  const formData = buildMultipart(data, files);
  const res = await jwtAxios.put(
    `${host}/${brandId}/boards/${boardId}/comments/${commentId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

// 댓글/대댓글 삭제
export const deleteComment = async ({ brandId, boardId, commentId }) => {
  const res = await jwtAxios.delete(
    `${host}/${brandId}/boards/${boardId}/comments/${commentId}`
  );
  return res.data;
};