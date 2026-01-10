import { useDispatch, useSelector } from "react-redux";
import { createSearchParams, Navigate, useNavigate } from "react-router-dom";
import { loginPostAsync, logout } from "../../store/slices/loginSlice";

const useCustomLogin = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  //Redux store의 loginSlice 상태를 가져옴
  const loginState = useSelector((state) => state.loginSlice); //-------로그인 상태

  const isLogin = loginState.email ? true : false; //----------로그인 여부

  const doLogin = async (loginParam) => {
    //----------로그인 함수

    return await dispatch(loginPostAsync(loginParam)).unwrap();
  };

  const doLogout = () => {
    //---------------로그아웃 함수

    dispatch(logout());
  };

  const moveToPath = (path) => {
    //----------------페이지 이동
    navigate({ pathname: path }, { replace: true }); // replace: true -> 이전 페이지 기억 x
  };

  const moveToLogin = () => {
    //----------------------로그인 페이지로 이동
    navigate({ pathname: "/member/login" }, { replace: true });
  };

  const moveToLoginReturn = () => {
    //----------------------로그인 페이지로 이동 컴포넌트
    return <Navigate replace to="/member/login" />;
  };

  //Axios 요청 중 JWT 만료, 권한 오류 등을 처리
  const exceptionHandle = (ex) => {
    console.log("Exception----------------------");

    console.log(ex);

    const errorMsg = ex.response.data.error;

    const errorStr = createSearchParams({ error: errorMsg }).toString();
    //createSearchParams({ error: errorMsg }) → URLSearchParams 객체 생성
    //.toString() → "error=REQUIRE_LOGIN" 문자열로 변환
    // navigate의 search에 넣으면 URL 쿼리 스트링으로 적용

    if (errorMsg === "REQUIRE_LOGIN") {
      alert("로그인 해야만 합니다.");
      navigate({ pathname: "/member/login", search: errorStr }); //member/login?error=REQUIRE_LOGIN : search를 통해 URL 뒤에 ?key=value 형태의 쿼리 파라미터를 붙임
      return;
    }

    if (ex.response.data.error === "ERROR_ACCESSDENIED") {
      alert("해당 메뉴를 사용할수 있는 권한이 없습니다.");
      navigate({ pathname: "/member/login", search: errorStr });
      return;
    }
  };
  return {
    exceptionHandle,
    loginState,
    isLogin,
    doLogin,
    doLogout,
    moveToPath,
    moveToLogin,
    moveToLoginReturn,
  };
};

export default useCustomLogin;
