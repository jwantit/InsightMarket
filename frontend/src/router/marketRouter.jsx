import { lazy } from "react";

const MarketList = lazy(() => import("../pages/market/MarketListPage"));
const Cart = lazy(() => import("../pages/market/CartPage"));
const PurchaseHistory = lazy(() =>
  import("../pages/market/PurchaseHistoryPage")
);
const ReportDetail = lazy(() => import("../pages/market/ReportDetailPage"));

const marketRouter = (wrap) => [
  { path: "solutions", element: wrap(MarketList) },
  { path: "cart", element: wrap(Cart) },
  { path: "history", element: wrap(PurchaseHistory) },
  { path: "reports/:solutionId", element: wrap(ReportDetail) },
];

export default marketRouter;
