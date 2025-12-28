import { lazy } from "react";
import snsRouter from "./snsRouter";
import aiRouter from "./aiRouter";
import boardRouter from "./boardRouter";
import marketRouter from "./marketRouter";
import adminRouter from "./adminRouter";
import AdminGuard from "../components/common/AdminGuard";

const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const BrandPage = lazy(() => import("../pages/brands-manage/BrandPage"));
const ProjectPage = lazy(() => import("../pages/projects/ProjectPage"));

const sideBarRouter = (wrap) => [
    //단일 경로
  { path: "dashboard", element: wrap(Dashboard) },
  { path: "brands-manage", element: wrap(BrandPage) },
  { path: "projects", element: wrap(ProjectPage) },

    // 하위 경로 있는 주소는 Router 함수 사용
   {
      path: "sns",
      children: snsRouter(wrap),
   },

    {
      path: "ai",
      children: aiRouter(wrap),
    },

    {
      path: "board",
      children: boardRouter(wrap),
    },

    {
      path: "market",
      children: marketRouter(wrap),
    },

    {
      path: "admin",
      element: <AdminGuard />,
      children: adminRouter(wrap),
    },
];

export default sideBarRouter;
