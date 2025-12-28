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
  //- brandId 없는 /app 엔트리 생성
  {
    path: "/app",
    element: <RequireAuth />, 
    children: [
      // /app (brandId 없음) -> RequireAuth가 redirect 처리
      { path: ""},

      // /app/:brandId 하위 
      {
        path: ":brandId",
        element: <MainLayout />,
        children: [
          ...topBarRouter(wrap),
          ...sideBarRouter(wrap),
          { path: "", element: <div>기본 메인 화면</div> },
        ],
      },
    ],
  },

  { path: "/", element: <Navigate to="/member/login" replace /> },
]);
