import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  brandId: null, // 브랜드 아이디
  brandName: null, // 브랜드 이름
  role: null, // 역할 (BRAND_ADMIN / MARKETER)
  brandList: null, //브랜드 리스트 (null: 로드 전, []: 로드 후 빈 배열)
};

const brandSlice = createSlice({
  name: "brandSlice",
  initialState,
  reducers: {
    setBrand(state, action) {
      const { brandId, brandName, role } = action.payload || {};
      if (brandId !== undefined) state.brandId = brandId;
      if (brandName !== undefined) state.brandName = brandName;
      if (role !== undefined) state.role = role;
    },
    setBrandList(state, action) {
      state.brandList = action.payload || [];
    },
    clearBrand(state) {
      state.brandId = null;
      state.brandName = null;
      state.role = null;
    },
  },
});

export const { setBrand, clearBrand, setBrandList } = brandSlice.actions;
export default brandSlice.reducer;
