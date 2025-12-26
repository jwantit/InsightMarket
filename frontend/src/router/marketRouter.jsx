import { lazy } from "react";

const MarketList = lazy(() => import("../pages/market/MarketListPage"));
const Cart = lazy(() => import("../pages/market/CartPage"));

const marketRouter = (wrap) => [
    { path: "solutions", element: wrap(MarketList) },
    { path: "cart", element: wrap(Cart) },
];

export default marketRouter;