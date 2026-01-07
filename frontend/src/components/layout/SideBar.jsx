import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useBrand } from "../../hooks/useBrand";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Rocket,
  BarChart3,
  PieChart,
  BrainCircuit,
  MessageSquare,
  ShoppingBag,
  History,
  Users,
  Settings,
  ShieldCheck,
  ChevronDown,
  ShoppingCart,
  LayoutList,
} from "lucide-react";

const cx = (...arr) => arr.filter(Boolean).join(" ");

// 스타일이 개선된 SideLink
const SideLink = ({ to, icon: Icon, children, onNavigate }) => (
  <NavLink
    to={to}
    onClick={onNavigate}
    className={({ isActive }) =>
      cx(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group",
        isActive
          ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )
    }
  >
    {Icon ? (
      <Icon
        size={18}
        className="shrink-0 group-hover:scale-110 transition-transform"
      />
    ) : (
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 ml-1.5 mr-1" />
    )}
    <span className="truncate">{children}</span>
  </NavLink>
);

// 애니메이션과 스타일이 개선된 Section
const Section = ({ title, open, onToggle, children }) => (
  <div className="mt-6">
    <button
      onClick={onToggle}
      className="w-full px-3 mb-2 flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-600 transition-colors"
    >
      {title}
      <ChevronDown
        size={14}
        className={cx(
          "transition-transform duration-300",
          open ? "rotate-180" : ""
        )}
      />
    </button>
    <div
      className={cx(
        "space-y-1 overflow-hidden transition-all duration-300 px-1",
        open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      {children}
    </div>
  </div>
);

const SideBar = ({ onNavigate }) => {
  const { brandId } = useBrand();
  const location = useLocation();

  const loginState = useSelector((state) => state.loginSlice);
  const systemRole = loginState?.role;
  const isAdminArea = systemRole === "ADMIN" || systemRole === "COMPANY_ADMIN";

  const [openMap, setOpenMap] = useState(() => {
    const p = location.pathname;
    return {
      sns: p.includes("/sns/"),
      ai: p.includes("/ai/"),
      board: p.includes("/board/"),
      market: p.includes("/market/"),
      admin: p.includes("/admin/"),
    };
  });

  const toggle = (key) => setOpenMap((m) => ({ ...m, [key]: !m[key] }));

  if (!brandId) return null;

  return (
    <aside className="w-72 lg:w-64 shrink-0 border-r border-slate-200 bg-white h-[calc(100vh-56px)] sticky top-14 overflow-y-auto scrollbar-hide">
      <div className="p-4">
        {/* 상단 기본 메뉴 */}
        <div className="mt-2 space-y-1">
          <SideLink
            to={`/app/${brandId}/dashboard`}
            icon={LayoutDashboard}
            onNavigate={onNavigate}
          >
            대시보드
          </SideLink>
          <SideLink
            to={`/app/${brandId}/brands`}
            icon={Building2}
            onNavigate={onNavigate}
          >
            브랜드 관리
          </SideLink>
          <SideLink
            to={`/app/${brandId}/projects`}
            icon={Rocket}
            onNavigate={onNavigate}
          >
            프로젝트 관리
          </SideLink>
        </div>

        {/* 섹션 메뉴들 */}
        <Section
          title="SNS 분석"
          open={openMap.sns}
          onToggle={() => toggle("sns")}
        >
          <SideLink
            to={`/app/${brandId}/sns/sentiment`}
            icon={BarChart3}
            onNavigate={onNavigate}
          >
            언급량 / 긍 · 부정
          </SideLink>
          <SideLink
            to={`/app/${brandId}/sns/comparison`}
            icon={PieChart}
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
          <SideLink
            to={`/app/${brandId}/ai/strategy`}
            icon={BrainCircuit}
            onNavigate={onNavigate}
          >
            전략 추천
          </SideLink>

          <SideLink
            to={`/app/${brandId}/ai/marketbot`}
            icon={MessageSquare}
            onNavigate={onNavigate}
          >
            상권 분석 봇
          </SideLink>
        </Section>

        <Section
          title="게시판"
          open={openMap.board}
          onToggle={() => toggle("board")}
        >
          <SideLink
            to={`/app/${brandId}/board/discussion`}
            icon={LayoutList}
            onNavigate={onNavigate}
          >
            커뮤니티
          </SideLink>
        </Section>

        <Section
          title="솔루션 마켓"
          open={openMap.market}
          onToggle={() => toggle("market")}
        >
          <SideLink
            to={`/app/${brandId}/market/solutions`}
            icon={ShoppingBag}
            onNavigate={onNavigate}
          >
            상품 목록
          </SideLink>
          <SideLink
            to={`/app/${brandId}/market/cart`}
            icon={ShoppingCart}
            onNavigate={onNavigate}
          >
            장바구니
          </SideLink>
          <SideLink
            to={`/app/${brandId}/market/history`}
            icon={History}
            onNavigate={onNavigate}
          >
            구매내역
          </SideLink>
        </Section>

        {isAdminArea && (
          <Section
            title="관리자"
            open={openMap.admin}
            onToggle={() => toggle("admin")}
          >
            <SideLink
              to={`/app/${brandId}/admin/approvals`}
              icon={ShieldCheck}
              onNavigate={onNavigate}
            >
              가입 승인
            </SideLink>
            <SideLink
              to={`/app/${brandId}/admin/users`}
              icon={Users}
              onNavigate={onNavigate}
            >
              사용자 계정 관리
            </SideLink>
            <SideLink
              to={`/app/${brandId}/admin/brand-permissions`}
              icon={Settings}
              onNavigate={onNavigate}
            >
              브랜드 권한 관리
            </SideLink>
          </Section>
        )}

        {/* 하단 푸터 영역 */}
        <div className="mt-10 mb-4 px-3">
          <p className="mt-6 text-[11px] text-slate-400 text-center">
            © {new Date().getFullYear()} InsightMarket
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
