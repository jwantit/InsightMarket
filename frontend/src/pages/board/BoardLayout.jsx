import React from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";

const BoardLayout = () => {
  const { brandId } = useBoardRouteParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const goList = () => {
    const query = searchParams.toString();
    navigate(`/app/${brandId}/board/discussion${query ? `?${query}` : ""}`);
  };

  const goAdd = () => navigate(`/app/${brandId}/board/discussion/add`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">브랜드 커뮤니티</h2>
        <div className="flex gap-2">
          <button
            onClick={goList}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            목록
          </button>
          <button
            onClick={goAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            글쓰기
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default BoardLayout;