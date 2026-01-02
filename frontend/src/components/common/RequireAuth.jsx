import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { getBrandList } from "../../api/brandApi";
import { setBrandList } from "../../store/slices/brandSlice";

// 접근 권한 체크 하는 함수
//1. 로그인 여부
//2. 로그인 유저가 그 brandId에 접근 권한이 있는지
//3. URL의 brandId가 유효한 숫자인지
const RequireAuth = () => {
  const dispatch = useDispatch();
  const loginState = useSelector((state) => state.loginSlice);
  const brands = useSelector((state) => state.brandSlice.brandList);
  const { brandId: brandIdParam } = useParams();

  //1. 로그인 여부
  if (!loginState || !loginState.email) {
    // 로그인 안 되어 있으면 /member/login으로
    return <Navigate to="/member/login" replace />;
  }

  // 브랜드 목록 로드 (아직 로드되지 않았을 경우)
  useEffect(() => {
    // brands가 null인 경우에만 로드 (빈 배열([])은 이미 로드된 것으로 간주)
    if (brands === null) {
      const fetchBrands = async () => {
        try {
          const data = await getBrandList();
          dispatch(
            setBrandList(
              (data || []).map((b) => ({
                brandId: b.brandId,
                name: b.name,
              }))
            )
          );
        } catch (error) {
          console.error("브랜드 목록 로드 실패:", error);
          // 에러 발생 시 빈 배열로 설정하여 무한 루프 방지
          dispatch(setBrandList([]));
        }
      };
      fetchBrands();
    }
  }, [brands, dispatch]);

  // 브랜드 목록 아직 준비 안 됐으면 대기
  if (brands === null) return null;

  // 2. 접근 가능한 브랜드 목록 조회
  /**
   * brandId가 URL에 없는 경우 처리
   *  - 브랜드 0개: 브랜드 생성 페이지로
   *  - 브랜드 1개 → 자동 진입
   *  - 브랜드 여러 개 → 선택 페이지
   */
  if (!brandIdParam) {
    

    if (brands.length === 1) {
      console.log("brands[0].brandId : ", brands[0].brandId);
      return <Navigate to={`/app/${brands[0].brandId}`} replace />;
    }

    return <Navigate to="/member/brand-select" replace />;
  }

  console.log("brandIdParam:", brandIdParam);
  console.log("current path:", window.location.pathname);

  // 3. brandId 숫자 체크
  const brandId = Number(brandIdParam);
  if (!Number.isFinite(brandId)) {
    return <Navigate to="/member/login" replace />;
  }

  // 접근 권한 체크
  const hasAccess = brands.some((b) => b.brandId === brandId);

  if (!hasAccess) {
    return <Navigate to="/member/login" replace />;
  }

  return <Outlet />; // 로그인 되어 있으면 자식 라우터 Outlet 렌더
};

export default RequireAuth;
