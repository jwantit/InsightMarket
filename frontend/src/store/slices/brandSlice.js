import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  brandId: null,     // 브랜드 아이디
  brandName: null,   // optional
  role: null,        // optional (BRAND_ADMIN / MARKETER)
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
    clearBrand(state) {
      state.brandId = null;
      state.brandName = null;
      state.role = null;
    },
  },
});

export const { setBrand, clearBrand } = brandSlice.actions;
export default brandSlice.reducer;
