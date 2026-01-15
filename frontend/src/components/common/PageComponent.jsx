import React from "react";

const PageComponent = ({ pageResponse, onChangePage, onChangeSize }) => {
  if (!pageResponse) return null;

  // 백엔드 응답: current(현재 페이지), pageRequestDTO.size, prev/next(10페이지 묶음 기준), prevPage/nextPage
  const { current, pageRequestDTO, prev, next, prevPage, nextPage, pageNumList = [] } = pageResponse;
  const page = current || pageRequestDTO?.page || 1;
  const size = pageRequestDTO?.size || 10;

  return (
    <div className="flex flex-col items-center gap-4 pt-6 border-t">
      <div className="flex items-center gap-4">
        <select
          value={size}
          onChange={(e) => onChangeSize(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {[10, 20, 50].map((s) => (
            <option key={s} value={s}>
              {s}개
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button
            disabled={!prev}
            onClick={() => prev && prevPage && onChangePage(prevPage)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          {pageNumList.map((p) => (
            <button
              key={p}
              onClick={() => onChangePage(p)}
              disabled={p === page}
              className="px-3 py-2 text-sm font-medium border rounded-lg transition-colors disabled:bg-blue-600 disabled:text-white disabled:border-blue-600 enabled:bg-white enabled:text-gray-700 enabled:border-gray-300 enabled:hover:bg-gray-50"
            >
              {p}
            </button>
          ))}
          <button
            disabled={!next}
            onClick={() => next && nextPage && onChangePage(nextPage)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageComponent;