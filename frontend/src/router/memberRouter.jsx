import { lazy, Suspense } from "react";
import Loading from "../components/common/Loading";

const Login = lazy(() => import("../pages/member/LoginPage"));
const Join = lazy(() => import("../pages/member/JoinPage"));
const KakaoRedirect = lazy(() => import("../pages/member/KakaoRedirectPage"));
const MemberModify = lazy(() => import("../pages/member/ModifyPage"));
const TokenRefresh = lazy(() => import("../pages/member/TokenRefresh"));
const BrandSelectPage = lazy(() => import("../pages/member/BrandSelectPage"));
const BrandCreatePage = lazy(() => import("../pages/member/BrandCreatePage"));
const NoBrandPage = lazy(() => import("../pages/member/NoBrandPage"));

const wrap = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const memberRouter = () => [
  { path: "login", element: wrap(Login) },
  { path: "join", element: wrap(Join) },
  { path: "kakao", element: wrap(KakaoRedirect) },
  { path: "modify", element: wrap(MemberModify) },
  { path: "refresh", element: wrap(TokenRefresh) },
  { path: "brand-select", element: wrap(BrandSelectPage) },
  { path: "brand-create", element: wrap(BrandCreatePage) },
  { path: "no-brand", element: wrap(NoBrandPage) },
];

export default memberRouter;
