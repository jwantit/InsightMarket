import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addSolutionToCart, removeCartItem, getCartItems } from "../../api/cartApi";

// 장바구니 아이템 조회 비동기 액션
//카트컴포넌트
export const getCartItemsAsync = createAsyncThunk(
  "cartSlice/getCartItemsAsync",
  async (projectid) => {
    const res = await getCartItems(projectid);
    return res;
  }
);

// 장바구니에 솔루션 추가/수량 변경 비동기 액션
export const addSolutionToCartAsync = createAsyncThunk(
  "cartSlice/addSolutionToCartAsync",
  async (itemDTO) => {
    const res = await addSolutionToCart(itemDTO);
    return res;
  }
);

// 장바구니 아이템 삭제 비동기 액션
export const removeCartItemAsync = createAsyncThunk(
  "cartSlice/removeCartItemAsync",
  async (cartItemid) => {
    const res = await removeCartItem(cartItemid);
    return res;
  }
);

//초기값 State
const initState = {
  items: [],
  totalPrice: 0,
};


const cartSlice = createSlice({
  name: "cartSlice",
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => { //호출 성공시 
    builder                                //초기값 , 가져온값
      .addCase(getCartItemsAsync.fulfilled, (state, action) => {
        console.log("getCartItemsAsync fulfilled");
        state.items = action.payload; // 백엔드에서 받은 아이템 목록으로 업데이트
        //{cartitemid : 7
        //imageUrl : null
        //solutionDescription : "A전략 기반 솔루션 1"
        //solutionid : 1
        //solutionprice : 1000
        //solutiontitle : "A전략 솔루션 1"}

        state.totalPrice = state.items.reduce(
          (acc, item) => acc + item.solutionprice, // 각 아이템의 solutionprice를 단순히 합산
          0
        ); // 총 금액 계산
      })
      .addCase(addSolutionToCartAsync.fulfilled, (state, action) => {
        console.log("addSolutionToCartAsync fulfilled");
        state.items = action.payload; // 백엔드에서 받은 아이템 목록으로 업데이트
        state.totalPrice = state.items.reduce(
          (acc, item) => acc + item.solutionprice, // 각 아이템의 solutionprice를 단순히 합산
          0
        ); // 총 금액 계산
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        console.log("removeCartItemAsync fulfilled");
        state.items = action.payload; // 백엔드에서 받은 아이템 목록으로 업데이트
        state.totalPrice = state.items.reduce(
          (acc, item) => acc + item.solutionprice, // 각 아이템의 solutionprice를 단순히 합산
          0
        ); // 총 금액 계산
      });
  },
});

export default cartSlice.reducer;
