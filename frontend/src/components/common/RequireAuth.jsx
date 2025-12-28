import { useSelector } from "react-redux";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { getBrandList } from "../../api/brandApi";
import { useEffect, useState } from "react";

// 접근 권한 체크 하는 함수 
//1. 로그인 여부 
//2. 로그인 유저가 그 brandId에 접근 권한이 있는지 
//3. URL의 brandId가 유효한 숫자인지
const RequireAuth = () => {

  const loginState = useSelector((state) => state.loginSlice);
  const { brandId: brandIdParam } = useParams();

  const [brands, setBrands] = useState(null); // null = 아직 로딩 안 됨

  //1. 로그인 여부
  if (!loginState || !loginState.email) {
    // 로그인 안 되어 있으면 /member/login으로
    return <Navigate to="/member/login" replace />;
  }

  // 2. 접근 가능한 브랜드 목록 조회
  useEffect(() => {
    getBrandList()
      .then((data) => {
        console.log("getBrandList success:", data);
        setBrands(data);
      })
      .catch((e) => {
        console.error("getBrandList failed:", e);
        setBrands([]); // 실패 시라도 null에서 벗어나게(디버깅 편함)
      });
  }, []);
  

  // 브랜드 목록 아직 안 왔으면 잠시 대기
  if (brands === null) {
    return null; // or <Loading />
  }

  /**
   * brandId가 URL에 없는 경우 처리
   *  - 브랜드 1개 → 자동 진입
   *  - 브랜드 여러 개 → 선택 페이지
   */
  if (!brandIdParam) {
    if (brands.length === 1) {
      console.log("brands[0].brandId : ", brands[0].brandId)
      return (
        <Navigate
          to={`/app/${brands[0].brandId}`}
          replace
        />
      );
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
