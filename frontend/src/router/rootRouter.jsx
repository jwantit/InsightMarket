import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/common/Loading";
import memberRouter from "./memberRouter";
import topBarRouter from "./topBarRouter";
import sideBarRouter from "./sideBarRouter";
import RequireAuth from "../components/common/RequireAuth";

const wrap = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // 회원 관련
  {
    path: "/member",
    children: memberRouter(),
  },
  // 앱 내부 (로그인 필수)
  {
    path: "/app/:brandId",
    element: <RequireAuth />, // 로그인 체크
    children: [
      {
        element: <MainLayout />,
        children: [
          ...topBarRouter(wrap), // TopBar 단일 경로
          ...sideBarRouter(wrap), // SideBar 하위 경로 함수
          { path: "", element: <div>기본 메인 화면</div> },
        ],
      },
    ],
  },
  { path: "/", element: <Navigate to="/member/login" replace /> },
]);
