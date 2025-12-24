import { lazy } from "react";

const StrategyPage = lazy(() => import("../pages/ai/StrategyPage"));
const ChatBot = lazy(() => import("../pages/ai/ChatBot"));

const aiRouter = (wrap) => [
    { path: "strategy", element: wrap(StrategyPage) },
    { path: "chatbot", element: wrap(ChatBot) },
];

export default aiRouter;