import { lazy } from "react";

const MarketList = lazy(() => import("../pages/market/MarketListPage"));
const Cart = lazy(() => import("../pages/market/CartPage"));
const PurchaseHistory = lazy(() => import("../pages/market/PurchaseHistoryPage"));

const marketRouter = (wrap) => [
    { path: "solutions", element: wrap(MarketList) },
    { path: "cart", element: wrap(Cart) },
    { path: "history", element: wrap(PurchaseHistory) },
];

export default marketRouter;