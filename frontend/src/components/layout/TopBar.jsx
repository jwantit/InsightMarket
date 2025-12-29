import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useCustomLogin from "../../hooks/useCustomLogin";
import { useBrand } from "../../hooks/useBrand";
import TopBarBrandSelectComponent from "./TopBarBrandSelectComponent";
import useMyBrands from "../../hooks/useMyBrands";

const TopBar = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);

  const { brands } = useMyBrands();
  const { brandId } = useBrand();
  const { doLogout, moveToPath } = useCustomLogin();

  // 로그인 정보
  const loginInfo = useSelector((state) => state.loginSlice);
  const userName = loginInfo?.name || "USER";
  const userEmail = loginInfo?.email || "";
  const initials = (userName || userEmail || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  // 드롭다운 바깥 클릭 / ESC 닫기
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onEsc = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    doLogout();
    alert("로그아웃되었습니다.");
    moveToPath("/");
  };

  if (!brandId) return null;

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
            to={`/app/${brandId}`}
            className="font-extrabold tracking-tight whitespace-nowrap text-lg sm:text-xl"
          >
            Insight<span className="text-blue-600">Market</span>
          </Link>

          {brands.length > 0 && (
            <div className="hidden sm:block ml-2">
              <TopBarBrandSelectComponent brands={brands} />
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <button className="rounded-md p-2 hover:bg-gray-100" title="알림">
            🔔
          </button>

          {/* User Button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={[
              "flex items-center gap-3 rounded-full border bg-white px-3 py-2",
              "hover:bg-gray-50 max-w-[260px] transition",
              open ? "ring-4 ring-gray-100 border-gray-300" : "",
            ].join(" ")}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div className="h-9 w-9 rounded-full bg-gray-900 text-white grid place-items-center text-sm font-extrabold">
              {initials}
            </div>

            <div className="min-w-0 hidden sm:flex flex-col items-start leading-tight">
              <div className="text-sm font-semibold text-gray-900 truncate w-[160px]">
                {userName}
              </div>
              <div className="text-[11px] text-gray-500 truncate w-[160px]">
                {userEmail || `Brand #${brandId}`}
              </div>
            </div>

            <span className="text-gray-400 hidden sm:block">▾</span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-14 w-72 rounded-2xl border bg-white shadow-xl overflow-hidden">
              {/* Header / Profile Summary */}
              <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gray-900 text-white grid place-items-center font-extrabold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {userEmail || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {loginInfo?.role || "ROLE"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    Brand #{brandId}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  to={`/app/${brandId}/profile`}
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-white">
                      👤
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900">프로필</div>
                      <div className="text-xs text-gray-500">내 정보 수정</div>
                    </div>
                  </div>
                  <span className="text-gray-300">›</span>
                </Link>

                <button
                  className="group w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 group-hover:bg-white">
                      ⎋
                    </span>
                    <div className="text-left">
                      <div className="font-semibold text-red-600">로그아웃</div>
                      <div className="text-xs text-red-400">세션 종료</div>
                    </div>
                  </div>
                  <span className="text-red-200">›</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
