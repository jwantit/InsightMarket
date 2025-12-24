import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const loginState = useSelector((state) => state.loginSlice);

  if (!loginState || !loginState.email) {
    // 로그인 안 되어 있으면 /member/login으로
    return <Navigate to="/member/login" replace />;
  }

  return <Outlet />; // 로그인 되어 있으면 자식 라우터 Outlet 렌더
};

export default RequireAuth;
