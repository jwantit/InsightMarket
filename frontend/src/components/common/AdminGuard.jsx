import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const AdminGuard = () => {
  const loginState = useSelector((state) => state.loginSlice);
  const role = loginState?.role; // 예: "ADMIN" | "COMPANY_ADMIN" | "USER"

  if (role !== "ADMIN" && role !== "COMPANY_ADMIN") {
    return <Navigate to={brandId ? `/app/${brandId}/dashboard` : "/app"} replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
