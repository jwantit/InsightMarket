import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

const TopBar = ({ onToggleSidebar }) => {
  const { tenantId } = useParams();
  const [open, setOpen] = useState(false);

  const { doLogout, moveToPath } = useCustomLogin();

  const handleLogout = () => {
    doLogout();
    alert("로그아웃되었습니다.");
    moveToPath("/"); // "/" → /member/login 으로 리다이렉트됨
  };

  return (
    <header className="h-14 w-full border-b bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden rounded-md p-2 hover:bg-gray-100"
            onClick={onToggleSidebar}
            aria-label="Open menu"
          >
            <div className="space-y-1">
              <div className="h-0.5 w-5 bg-gray-800" />
              <div className="h-0.5 w-5 bg-gray-800" />
              <div className="h-0.5 w-5 bg-gray-800" />
            </div>
          </button>

          <Link
            to={`/app/${tenantId}`}
            className="font-extrabold tracking-tight text-base sm:text-lg whitespace-nowrap"
          >
            Insight<span className="text-blue-600">Market</span>
          </Link>

          {/* 워크스페이스 전환 (드롭다운으로 쓸 자리) */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              to={`/app/${tenantId}/brands`}
              className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
            >
              브랜드
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 relative">
          <button className="rounded-md p-2 hover:bg-gray-100" title="알림">
            🔔
          </button>

          {/* User Button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full border bg-white px-3 py-2 hover:bg-gray-50 max-w-[240px]"
          >
            <div className="h-9 w-9 rounded-full bg-gray-200 grid place-items-center text-sm font-extrabold">
              U
            </div>

            <div className="min-w-0 hidden sm:flex flex-col items-start leading-tight">
              <div className="text-sm font-semibold text-gray-800 truncate w-[150px]">
                USER
              </div>
              <div className="text-[11px] text-gray-500 truncate w-[150px]">
                {tenantId}
              </div>
            </div>

            <span className="text-gray-400 hidden sm:block">▾</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-14 w-56 rounded-xl border bg-white shadow-lg overflow-hidden">
              <Link
                to={`/app/${tenantId}/profile`}
                className="block px-4 py-3 text-sm hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                프로필
              </Link>
              <button
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
