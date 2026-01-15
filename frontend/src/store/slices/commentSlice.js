import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createComment,
  deleteComment,
  getCommentTree,
  updateComment,
} from "../../api/commentApi";

export const fetchCommentTree = createAsyncThunk(
  "comment/tree",
  async ({ brandId, boardId }, { rejectWithValue }) => {
    try {
      const data = await getCommentTree({ brandId, boardId });
      // ERROR_ACCESS_TOKEN 응답 체크
      if (data && data.error === "ERROR_ACCESS_TOKEN") {
        return rejectWithValue("ERROR_ACCESS_TOKEN");
      }
      return { boardId, data };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCommentThunk = createAsyncThunk(
  "comment/create",
  async ({ brandId, boardId, payload }) => {
    const data = await createComment({
      brandId,
      boardId,
      data: payload.data,
      files: payload.files,
    });
    return { boardId, data };
  }
);

export const updateCommentThunk = createAsyncThunk(
  "comment/update",
  async ({ brandId, boardId, commentId, payload }) => {
    const data = await updateComment({
      brandId,
      boardId,
      commentId,
      data: payload.data,
      files: payload.files,
    });
    return { boardId, data };
  }
);

export const deleteCommentThunk = createAsyncThunk(
  "comment/delete",
  async ({ brandId, boardId, commentId }) => {
    await deleteComment({ brandId, boardId, commentId });
    return { boardId, commentId };
  }
);

const initialState = {
  treeByBoardId: {},
  statusByBoardId: {},
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentTree.pending, (state, action) => {
        const { boardId } = action.meta.arg;
        state.statusByBoardId[boardId] = "loading";
      })
      .addCase(fetchCommentTree.fulfilled, (state, action) => {
        const { boardId, data } = action.payload;
        state.treeByBoardId[boardId] = data;
        state.statusByBoardId[boardId] = "succeeded";
      })
      .addCase(fetchCommentTree.rejected, (state, action) => {
        const { boardId } = action.meta.arg;
        state.statusByBoardId[boardId] = "failed";
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        const { boardId } = action.payload;
        state.statusByBoardId[boardId] = "needs-refetch";
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        const { boardId } = action.payload;
        state.statusByBoardId[boardId] = "needs-refetch";
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        const { boardId } = action.payload;
        state.statusByBoardId[boardId] = "needs-refetch";
      });
  },
});

export const selectCommentTree = (state, boardId) =>
  state.comment.treeByBoardId[boardId];

export const selectCommentStatus = (state, boardId) =>
  state.comment.statusByBoardId[boardId] || "idle";

export default commentSlice.reducer;