import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCommentThunk,
  deleteCommentThunk,
  fetchCommentTree,
  selectCommentStatus,
  selectCommentTree,
  updateCommentThunk,
} from "../../store/slices/commentSlice";

const useComments = (brandId, boardId) => {
  const dispatch = useDispatch();
  const tree = useSelector((state) => selectCommentTree(state, boardId));
  const status = useSelector((state) => selectCommentStatus(state, boardId));

  useEffect(() => {
    if (boardId && status === "idle") {
      dispatch(fetchCommentTree({ brandId, boardId }));
    }
  }, [brandId, boardId, status, dispatch]);

  useEffect(() => {
    if (status === "needs-refetch") {
      dispatch(fetchCommentTree({ brandId, boardId }));
    }
  }, [status, brandId, boardId, dispatch]);

  const createComment = async (payload) =>
    dispatch(createCommentThunk({ brandId, boardId, payload }));

  const updateComment = async (commentId, payload) =>
    dispatch(updateCommentThunk({ brandId, boardId, commentId, payload }));

  const deleteComment = async (commentId) =>
    dispatch(deleteCommentThunk({ brandId, boardId, commentId }));

  return { tree: tree || [], status, createComment, updateComment, deleteComment };
};

export default useComments;