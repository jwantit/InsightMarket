import { useState } from "react";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";
import useCustomLogin from "../../hooks/login/useCustomLogin";
import KakaoLoginComponent from "./KakaoLoginComponent";

const initState = {
  email: "",
  pw: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { doLogin, moveToPath } = useCustomLogin();

  const handleChange = (e) => {
    setLoginParam({
      ...loginParam,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickLogin = () => {
    doLogin(loginParam)
      .then((data) => {
        moveToPath("/app");
      })
      .catch((errorData) => {
        console.log("ERROR DATA:", errorData);

        if (errorData?.error === "NOT_APPROVED") {
          alert("관리자 승인 후 로그인 가능합니다.");
        } else if (errorData?.error === "BAD_CREDENTIALS") {
          alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        } else {
          alert("로그인 실패");
        }
      });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">
            Insight<span className="text-blue-600">Market</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 font-medium">
            브랜드 인사이트를 한 곳에서 관리하세요
          </p>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="p-8 space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            이메일
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail size={18} className="text-slate-400" />
            </div>
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
              name="email"
              type="text"
              placeholder="user@example.com"
              value={loginParam.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            비밀번호
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock size={18} className="text-slate-400" />
            </div>
            <input
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
              name="pw"
              type="password"
              placeholder="••••••••"
              value={loginParam.pw}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleClickLogin}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <LogIn size={18} />
          로그인
        </button>

        {/* 회원가입 이동 */}
        <div className="pt-2 text-center">
          <button
            onClick={() => moveToPath("/member/join")}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            아직 계정이 없으신가요? <span className="font-bold">회원가입</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">또는</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <KakaoLoginComponent />
      </div>

      {/* Footer */}
      <div className="px-8 pb-6 pt-2 text-center">
        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} InsightMarket
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
