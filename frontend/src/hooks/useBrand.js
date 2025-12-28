import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBrand } from "../store/slices/brandSlice";

// 이 useBrand hook을 /app/:brandId 아래의 컴포넌트에서만 쓸것.
export const useBrand = () => {
  const { brandId: brandIdParam } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const brand = useSelector((state) => state.brandSlice);

  const parsedBrandId = useMemo(() => {
    if (!brandIdParam) return null;
    const n = Number(brandIdParam);
    return Number.isFinite(n) ? n : null;
  }, [brandIdParam]);

  // 1) URL -> Redux 동기화
  useEffect(() => {
    if (parsedBrandId == null) return;

    if (brand.brandId !== parsedBrandId) {
      dispatch(setBrand({ brandId: parsedBrandId }));
    }
  }, [parsedBrandId]);

  // 2) 잘못된 brandId(문자 등)로 들어오면 안전하게 리다이렉트 
  useEffect(() => {
    // "/app/projects" 같은 경우 brandIdParam="projects" -> parsedBrandId null
    if (brandIdParam && parsedBrandId == null) {
      // 로그인 화면 
      navigate("/member/login", { replace: true, state: { from: location } });
    }
  }, [brandIdParam, parsedBrandId]);

  return {
    brandId: brand.brandId,
    brandName: brand.brandName,
    role: brand.role,
  };
};
