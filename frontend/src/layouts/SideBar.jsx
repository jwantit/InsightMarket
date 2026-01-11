import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useBrand } from "../hooks/brand/useBrand";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Rocket,
  BarChart3,
  PieChart,
  BrainCircuit,
  Navigation,
  ShoppingBag,
  History,
  Users,
  Settings,
  ShieldCheck,
  ChevronDown,
  ShoppingCart,
  LayoutList,
  Image as ImageIcon,
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

const SideBar = ({ isOpen, onNavigate }) => {
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
    <>
      <aside
        className={cx(
          "shrink-0 border-r border-slate-200 bg-white overflow-y-auto scrollbar-hide transform-gpu z-[60]",
          "w-72 min-[1441px]:w-64",
          // 애니메이션: 오직 transform(가로 이동)만 300ms 동안 작동하도록 설정
          "max-[1440px]:transition-transform max-[1440px]:duration-300 max-[1440px]:ease-in-out",
          // PC 모드 (1441px 이상)
          "min-[1441px]:sticky min-[1441px]:top-14 min-[1441px]:h-[calc(100vh-56px)] min-[1441px]:translate-x-0",
          // 모바일 모드 (1440px 이하) - top과 left를 0으로 고정하여 수직 이동 방지
          "max-[1440px]:fixed max-[1440px]:!top-0 max-[1440px]:!left-0 max-[1440px]:h-full max-[1440px]:shadow-2xl",
          isOpen ? "max-[1440px]:translate-x-0" : "max-[1440px]:-translate-x-full"
        )}
        style={{ willChange: 'transform' }}
      >
        <div className="p-4">
          {/* 1440px 이하일 때 로고와 닫기 버튼 */}
          <div className="min-[1441px]:hidden flex items-center justify-between mb-8 px-2">
            <span className="font-black text-xl tracking-tight text-slate-900">
              Insight<span className="text-blue-600">Market</span>
            </span>
            <button
              onClick={onNavigate}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"
            >
              <ChevronDown size={20} className="rotate-90" />
            </button>
          </div>

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
            icon={Navigation}
            onNavigate={onNavigate}
          >
            상권 분석
          </SideLink>

          <SideLink
            to={`/app/${brandId}/ai/image-analysis`}
            icon={ImageIcon}
            onNavigate={onNavigate}
          >
            광고 이미지 분석
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
    </>
  );
};

export default SideBar;

