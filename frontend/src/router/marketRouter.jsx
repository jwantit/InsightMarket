import { lazy } from "react";

const MarketList = lazy(() => import("../pages/market/MarketList"));
const Cart = lazy(() => import("../pages/market/Cart"));

const marketRouter = (wrap) => [
    { path: "solutions", element: wrap(MarketList) },
    { path: "cart", element: wrap(Cart) },
];

export default marketRouter;