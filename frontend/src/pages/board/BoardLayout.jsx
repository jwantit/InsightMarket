import React from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, Plus, List } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              브랜드 커뮤니티
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goList}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
          >
            <List size={18} />
            목록
          </button>
          <button
            onClick={goAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus size={18} />
            글쓰기
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default BoardLayout;