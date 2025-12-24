import { lazy } from "react";

const AdminSystem = lazy(() => import("../pages/admin/AdminSystem"));

const adminRouter = (wrap) => [
    { path: "system", element: wrap(AdminSystem) },
];

export default adminRouter;