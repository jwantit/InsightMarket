import { lazy } from "react";

const StrategyPage = lazy(() => import("../pages/ai/StrategyPage"));
const ChatBot = lazy(() => import("../pages/ai/ChatBot"));
const AiQuickTestPage = lazy(() => import("../pages/ai/AiQuickTestPage"));

const aiRouter = (wrap) => [
    { path: "strategy", element: wrap(StrategyPage) },
    { path: "chatbot", element: wrap(ChatBot) },
    { path: "quick-test", element: wrap(AiQuickTestPage) },
];

export default aiRouter;