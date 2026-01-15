import { lazy } from "react";

const AdminApprovals = lazy(() => import("../pages/admin/AdminApprovalsPage"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminBrandPermissions = lazy(() =>
  import("../pages/admin/AdminBrandPermissionsPage")
);

const adminRouter = (wrap) => [
  { path: "approvals", element: wrap(AdminApprovals) }, // 가입 승인
  { path: "users", element: wrap(AdminUsers) }, // 사용자 계정 관리
  { path: "brand-permissions", element: wrap(AdminBrandPermissions) }, // 브랜드 권한 관리
];

export default adminRouter;
