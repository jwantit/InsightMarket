import React from "react";
import { Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { LayoutList, Plus, List } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import useBoardRouteParams from "../../hooks/board/useBoardRouteParams";

const BoardLayout = () => {
  const { brandId } = useBoardRouteParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 현재 경로가 목록 페이지인지 확인 (/read/, /add, /modify/가 없으면 목록 페이지)
  const isListPage = !location.pathname.match(/\/read\/|\/add|\/modify\//);

  const goList = () => {
    const query = searchParams.toString();
    navigate(`/app/${brandId}/board/discussion${query ? `?${query}` : ""}`);
  };

  const goAdd = () => navigate(`/app/${brandId}/board/discussion/add`);

  const headerExtra = (
    <div className="flex items-center gap-2">
      {!isListPage && (
        <button
          onClick={goList}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
        >
          <List size={18} />
          목록
        </button>
      )}
      <button
        onClick={goAdd}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95"
      >
        <Plus size={18} />
        글쓰기
      </button>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={LayoutList}
        title="브랜드 커뮤니티"
        breadcrumb="Community / Discussion"
        subtitle="브랜드 내부 커뮤니티에서 팀원들과 의견을 공유하고 소통할 수 있습니다."
        extra={headerExtra}
      />
      <Outlet />
    </div>
  );
};

export default BoardLayout;