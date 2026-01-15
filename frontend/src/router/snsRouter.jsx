import { lazy } from "react";

const SentimentTrend = lazy(() => import("../pages/sns/SentimentTrendPage"));
const Comparison = lazy(() => import("../pages/sns/ComparisonPage"));

const snsRouter = (wrap) => [
  { path: "sentiment", element: wrap(SentimentTrend) },
  { path: "comparison", element: wrap(Comparison) },
];

export default snsRouter;
