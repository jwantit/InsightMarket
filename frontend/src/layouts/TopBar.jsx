import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Shield,
  ExternalLink,
} from "lucide-react";
import useCustomLogin from "../hooks/login/useCustomLogin";
import { useBrand } from "../hooks/brand/useBrand";
import useMyBrands from "../hooks/brand/useMyBrands";
import TopBarBrandSelect from "./TopBarBrandSelect";

const TopBar = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const { brands } = useMyBrands();
  const { brandId } = useBrand();
  const { doLogout, moveToPath } = useCustomLogin();
  const loginInfo = useSelector((state) => state.loginSlice);
  const menuRef = useRef(null);

  const userName = loginInfo?.name || "사용자";
  const userEmail = loginInfo?.email || "";
  const initials = userName.slice(0, 1).toUpperCase();

  useEffect(() => {
    const close = (e) => {
      if (open && !menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleLogout = () => {
    doLogout();
    alert("로그아웃 되었습니다.");
    moveToPath("/");
  };

  if (!brandId) return null;

  return (
    <header className="h-14 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <div className="space-y-1.5 w-5">
              <div className="h-0.5 bg-slate-600 rounded-full" />
              <div className="h-0.5 bg-slate-600 rounded-full" />
              <div className="h-0.5 bg-slate-600 rounded-full" />
            </div>
          </button>

          <Link
            to={`/app/${brandId}/dashboard`}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-black text-lg">I</span>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 hidden sm:block">
              Insight<span className="text-blue-600">Market</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

          <div className="hidden md:block">
            <TopBarBrandSelect />
          </div>
        </div>

        <div className="flex items-center gap-3" ref={menuRef}>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
          </button>

          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${
              open
                ? "bg-slate-50 border-blue-200 ring-4 ring-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {loginInfo?.role}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                  My Account
                </p>
                <p className="text-sm font-bold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
              <div className="p-2">
                <Link
                  to={`/app/${brandId}/profile`}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <User size={16} className="text-slate-400" /> 프로필 설정
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={16} /> 로그아웃
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

