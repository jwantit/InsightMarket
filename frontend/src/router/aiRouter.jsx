import { lazy } from "react";

const StrategyPage = lazy(() => import("../pages/ai/StrategyPage"));
const MarketBot = lazy(() => import("../pages/ai/MarketBot"));
const MarketBotResultPage = lazy(() => import("../pages/ai/MarketBotResultPage"));
const MarketBotGuidePage = lazy(() => import("../pages/ai/MarketBotGuidePage"));
const ImageAnalysisPage = lazy(() => import("../pages/ai/ImageAnalysisPage"));

const aiRouter = (wrap) => [
    { path: "strategy", element: wrap(StrategyPage) },
    { path: "marketbot", element: wrap(MarketBot) },
    { path: "marketbot/result", element: wrap(MarketBotResultPage) },
    { path: "marketbot/guide", element: wrap(MarketBotGuidePage) },
    { path: "image-analysis", element: wrap(ImageAnalysisPage) },
];

export default aiRouter;