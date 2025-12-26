import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createBoard,
  deleteBoard,
  getBoardDetail,
  getBoardList,
  updateBoard,
} from "../../api/boardApi";

const keyOf = ({ brandId, page, size }) => `${brandId}:${page}:${size}`;

export const fetchBoardList = createAsyncThunk(
  "board/list",
  async ({ brandId, page = 1, size = 10 }) => {
    const data = await getBoardList({ brandId, page, size });
    return { brandId, page, size, data };
  }
);

export const fetchBoardDetail = createAsyncThunk(
  "board/detail",
  async ({ brandId, boardId }) => {
    const data = await getBoardDetail({ brandId, boardId });
    return { boardId, data };
  }
);

export const createBoardThunk = createAsyncThunk(
  "board/create",
  async ({ brandId, payload }) => {
    const data = await createBoard({
      brandId,
      data: payload.data,
      files: payload.files,
    });
    return data;
  }
);

export const updateBoardThunk = createAsyncThunk(
  "board/update",
  async ({ brandId, boardId, payload }) => {
    const data = await updateBoard({
      brandId,
      boardId,
      data: payload.data,
      files: payload.files,
    });
    return { boardId, data };
  }
);

export const deleteBoardThunk = createAsyncThunk(
  "board/delete",
  async ({ brandId, boardId }) => {
    await deleteBoard({ brandId, boardId });
    return { boardId };
  }
);

const initialState = {
  listByKey: {},
  detailById: {},
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoardList.fulfilled, (state, action) => {
        const { brandId, page, size, data } = action.payload;
        state.listByKey[keyOf({ brandId, page, size })] = data;
      })
      .addCase(fetchBoardDetail.fulfilled, (state, action) => {
        const { boardId, data } = action.payload;
        state.detailById[boardId] = data;
      })
      .addCase(updateBoardThunk.fulfilled, (state, action) => {
        const { boardId, data } = action.payload;
        state.detailById[boardId] = data;
      })
      .addCase(deleteBoardThunk.fulfilled, (state, action) => {
        const { boardId } = action.payload;
        delete state.detailById[boardId];
      });
  },
});

export const selectBoardList = (state, { brandId, page, size }) =>
  state.board.listByKey[keyOf({ brandId, page, size })];

export const selectBoardDetail = (state, boardId) =>
  state.board.detailById[boardId];

export default boardSlice.reducer;