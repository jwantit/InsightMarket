import { configureStore} from "@reduxjs/toolkit";
import loginSlice from "./slices/loginSlice";
import boardSlice from "./slices/boardSlice";
import commentSlice from "./slices/commentSlice";
import cartSlice from "./slices/cartSlice";
import brandSlice from "./slices/brandSlice";

const store = configureStore({
  reducer: {
      loginSlice: loginSlice,
      board: boardSlice,
      comment: commentSlice,
      cartSlice : cartSlice,
      brandSlice: brandSlice,
    },
});

export default store;
