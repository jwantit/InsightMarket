import { lazy } from "react";

const BrandSwitch = lazy(() => import("../pages/brands/BrandSwitch"));
const Profile = lazy(() => import("../pages/profile/ProfilePage"));

const topBarRouter = (wrap) => [
  { path: "brands", element: wrap(BrandSwitch) },
  { path: "profile", element: wrap(Profile) },
];

export default topBarRouter;
