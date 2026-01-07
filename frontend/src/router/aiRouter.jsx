import { lazy } from "react";

const StrategyPage = lazy(() => import("../pages/ai/StrategyPage"));
const MarketBot = lazy(() => import("../pages/ai/MarketBot"));
const MarketBotResultPage = lazy(() => import("../pages/ai/MarketBotResultPage"));
const MarketBotGuidePage = lazy(() => import("../pages/ai/MarketBotGuidePage"));

const aiRouter = (wrap) => [
    { path: "strategy", element: wrap(StrategyPage) },
    { path: "marketbot", element: wrap(MarketBot) },
    { path: "marketbot/result", element: wrap(MarketBotResultPage) },
    { path: "marketbot/guide", element: wrap(MarketBotGuidePage) },
];

export default aiRouter;