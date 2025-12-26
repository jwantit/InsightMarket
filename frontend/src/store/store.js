import { configureStore, createSlice } from "@reduxjs/toolkit";
import loginSlice from "./slices/loginSlice";
import boardSlice from "./slices/boardSlice";
import commentSlice from "./slices/commentSlice";

const store = configureStore({
  reducer: {
      loginSlice: loginSlice,
      board: boardSlice,
      comment: commentSlice,
    },
});

export default store;
