import { lazy } from "react";

const Profile = lazy(() => import("../pages/profile/ProfilePage"));

const topBarRouter = (wrap) => [{ path: "profile", element: wrap(Profile) }];

export default topBarRouter;
