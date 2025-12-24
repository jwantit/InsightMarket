import { useMemo, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";

const cx = (...arr) => arr.filter(Boolean).join(" ");

const SideLink = ({ to, children, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      cx(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition",
        isActive
          ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-100"
          : "text-gray-700 hover:bg-gray-100"
      )
    }
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
    <span className="truncate">{children}</span>
  </NavLink>
);

const Section = ({ title, open, onToggle, children }) => (
  <div className="mt-5">
    <button
      onClick={onToggle}
      className="w-full px-3 mb-2 flex items-center justify-between text-xs font-bold tracking-wide text-gray-500 uppercase hover:text-gray-700"
    >
      {title}
      <span className={cx("transition", open ? "rotate-180" : "")}>⌄</span>
    </button>
    {open && <div className="space-y-1">{children}</div>}
  </div>
);

const SideBar = ({ onNavigate }) => {
  const { tenantId } = useParams();
  const location = useLocation();

  // 현재 페이지 기반으로 기본 섹션 open 처리
  const defaultOpen = useMemo(() => {
    const p = location.pathname;
    return {
      dash: true,
      sns: p.includes("/sns/"),
      ai: p.includes("/ai/"),
      board: p.includes("/board/"),
      market: p.includes("/market/"),
      admin: p.includes("/admin/"),
    };
  }, [location.pathname]);

  const [openMap, setOpenMap] = useState(defaultOpen);

  const toggle = (key) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));

  return (
    <aside className="w-72 lg:w-64 shrink-0 border-r bg-white h-[calc(100vh-56px)] sticky top-14 overflow-y-auto">
      <div className="p-4">
        <div className="mt-6 space-y-1">
          <SideLink to={`/app/${tenantId}/dashboard`} onNavigate={onNavigate}>
            대시보드
          </SideLink>
          <SideLink
            to={`/app/${tenantId}/brands-manage`}
            onNavigate={onNavigate}
          >
            브랜드 관리
          </SideLink>
          <SideLink to={`/app/${tenantId}/projects`} onNavigate={onNavigate}>
            프로젝트 / 캠페인
          </SideLink>
        </div>

        <Section
          title="SNS 분석"
          open={openMap.sns}
          onToggle={() => toggle("sns")}
        >
          <SideLink
            to={`/app/${tenantId}/sns/keywords`}
            onNavigate={onNavigate}
          >
            키워드 관리
          </SideLink>
          <SideLink
            to={`/app/${tenantId}/sns/sentiment`}
            onNavigate={onNavigate}
          >
            감성/트렌드
          </SideLink>
          <SideLink
            to={`/app/${tenantId}/sns/comparison`}
            onNavigate={onNavigate}
          >
            경쟁사 비교
          </SideLink>
        </Section>

        <Section
          title="AI 마케팅"
          open={openMap.ai}
          onToggle={() => toggle("ai")}
        >
          <SideLink to={`/app/${tenantId}/ai/strategy`} onNavigate={onNavigate}>
            전략 추천
          </SideLink>
          <SideLink to={`/app/${tenantId}/ai/chatbot`} onNavigate={onNavigate}>
            챗봇
          </SideLink>
        </Section>

        <Section
          title="게시판"
          open={openMap.board}
          onToggle={() => toggle("board")}
        >
          <SideLink
            to={`/app/${tenantId}/board/discussion`}
            onNavigate={onNavigate}
          >
            전략 토론
          </SideLink>
        </Section>

        <Section
          title="솔루션 마켓"
          open={openMap.market}
          onToggle={() => toggle("market")}
        >
          <SideLink
            to={`/app/${tenantId}/market/solutions`}
            onNavigate={onNavigate}
          >
            상품 목록
          </SideLink>
          <SideLink to={`/app/${tenantId}/market/cart`} onNavigate={onNavigate}>
            장바구니
          </SideLink>
        </Section>

        <Section
          title="관리자"
          open={openMap.admin}
          onToggle={() => toggle("admin")}
        >
          <SideLink
            to={`/app/${tenantId}/admin/system`}
            onNavigate={onNavigate}
          >
            시스템 설정
          </SideLink>
        </Section>

        <div className="mt-6 px-3 text-xs text-gray-400">
          © {new Date().getFullYear()} InsightMarket
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
