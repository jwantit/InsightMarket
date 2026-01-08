import { lazy } from "react";

const StrategyPage = lazy(() => import("../pages/ai/StrategyPage"));
const MarketAnalysisPage = lazy(() => import("../pages/ai/MarketAnalysisPage"));
const ImageAnalysisPage = lazy(() => import("../pages/ai/ImageAnalysisPage"));

const aiRouter = (wrap) => [
  { path: "strategy", element: wrap(StrategyPage) },
  { path: "marketbot", element: wrap(MarketAnalysisPage) },
  { path: "image-analysis", element: wrap(ImageAnalysisPage) },
];

export default aiRouter;
