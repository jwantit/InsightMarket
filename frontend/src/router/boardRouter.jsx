import { lazy } from "react";

const StrategyBoard = lazy(() => import("../pages/board/StrategyBoard"));

const boardRouter = (wrap) => [
   { path: "discussion", element: wrap(StrategyBoard) },
];

export default boardRouter;