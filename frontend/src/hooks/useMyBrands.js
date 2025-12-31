import { useEffect, useState } from "react";
import { getBrandList } from "../api/brandApi";
import { useDispatch, useSelector } from "react-redux";
import { setBrandList } from "../store/slices/brandSlice";

const useMyBrands = () => {
  const dispatch = useDispatch();
  const brands = useSelector((state) => state.brandSlice.brandList);
  const loading = brands === null || brands === undefined;

  const fetch = async () => {
    const data = await getBrandList();
    dispatch(
      setBrandList(
        (data || []).map((b) => ({
          brandId: b.brandId,
          name: b.name,
        }))
      )
    );
  };

  useEffect(() => {
    fetch();
  }, []);

  return { brands: brands || [], loading, refreshBrands: fetch };
};
export default useMyBrands;
