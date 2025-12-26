import { lazy } from "react";

const BoardLayout = lazy(() => import("../pages/board/BoardLayout"));
const StrategyBoard = lazy(() => import("../pages/board/StrategyBoard"));
const BoardListPage   = lazy(() => import("../pages/board/BoardListPage"));
const BoardReadPage   = lazy(() => import("../pages/board/BoardReadPage"));
const BoardAddPage    = lazy(() => import("../pages/board/BoardAddPage"));
const BoardModifyPage = lazy(() => import("../pages/board/BoardModifyPage"));

const boardRouter = (wrap) => [
  {
      path: "discussion",
      element: wrap(BoardLayout),
      children: [
        { path: "", element: wrap(BoardListPage) },
        { path: "read/:boardId", element: wrap(BoardReadPage) },
        { path: "add", element: wrap(BoardAddPage) },
        { path: "modify/:boardId", element: wrap(BoardModifyPage) },
      ],
    },
];

export default boardRouter;