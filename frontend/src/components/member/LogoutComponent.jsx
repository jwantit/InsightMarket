// import useCustomLogin from "../../hooks/login/useCustomLogin";

// const LogoutComponent = () => {
//   const { doLogout, moveToPath } = useCustomLogin();

//   const handleClickLogout = () => {
//     doLogout();
//     alert("로그아웃되었습니다.");
//     moveToPath("/");
//   };

//   return (
//     <div className="border-2 border-red-200 mt-10 m-2 p-4">
//       <div className="flex justify-center">
//         <div className="text-4xl m-4 p-4 font-extrabold text-red-500">
//           Logout Component
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <div className="relative mb-4 flex w-full justify-center">
//           <div className="w-2/5 p-6 flex justify-center font-bold">
//             <button
//               className="rounded p-4 w-36 bg-red-500 text-xl  text-white"
//               onClick={handleClickLogout}
//             >
//               LOGOUT
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LogoutComponent;

import { useState } from "react";
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  CheckCircle2,
  BarChart3,
  BrainCircuit,
  Zap,
} from "lucide-react";
import useCustomLogin from "../../hooks/login/useCustomLogin";
import KakaoLoginComponent from "./KakaoLoginComponent";
import { showAlert } from "../../hooks/common/useAlert";

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
      .catch(async (errorData) => {
        if (errorData?.error === "NOT_APPROVED") {
          await showAlert("관리자 승인 후 로그인 가능합니다.", "warning");
        } else if (errorData?.error === "BAD_CREDENTIALS") {
          await showAlert("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
        } else {
          await showAlert("로그인 실패", "error");
        }
      });
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      {/* [왼쪽 섹션] 브랜드 홍보 및 비주얼 - 큰 화면에서만 보임 */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 items-center justify-center p-12 overflow-hidden">
        {/* 배경 장식 패턴 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Sparkles className="text-white" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">
              InsightMarket
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight mb-6 tracking-tight">
            데이터로 브랜드의 <br />
            <span className="text-blue-200">미래를 설계하세요.</span>
          </h1>

          <p className="text-lg text-blue-100/80 mb-12 font-medium leading-relaxed">
            InsightMarket은 AI 기반 소셜 데이터 분석을 통해 <br />
            가장 빠르고 정확한 마케팅 전략을 제안합니다.
          </p>

          {/* 서비스 특징 리스트 */}
          <div className="space-y-6">
            {[
              { icon: BarChart3, text: "실시간 SNS 감성 분석 및 언급량 추적" },
              {
                icon: BrainCircuit,
                text: "AI 에이전트를 통한 맞춤형 전략 도출",
              },
              { icon: Zap, text: "경쟁사 벤치마킹 및 마켓 쉐어 인사이트" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-all">
                  <item.icon size={20} className="text-blue-200" />
                </div>
                <span className="font-semibold text-blue-50">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 푸터 장식 */}
        <div className="absolute bottom-12 left-12 flex items-center gap-6 text-blue-200/50 text-sm font-bold uppercase tracking-widest">
          <span>Enterprise AI</span>
          <div className="w-1 h-1 bg-blue-400 rounded-full" />
          <span>Data Intelligence</span>
        </div>
      </div>

      {/* [오른쪽 섹션] 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        {/* 모바일에서만 보이는 로고 */}
        <div className="lg:hidden mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            InsightMarket
          </h2>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500 font-medium">
              서비스를 이용하려면 계정에 로그인하세요.
            </p>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                이메일 주소
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none"
                  name="email"
                  type="text"
                  placeholder="user@example.com"
                  value={loginParam.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  비밀번호
                </label>
                <button className="text-[10px] font-bold text-blue-600 hover:underline">
                  비밀번호 찾기
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none"
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
              className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-4 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-sm transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 active:scale-95"
            >
              <LogIn size={18} />
              인사이트 마켓 시작하기
            </button>

            {/* Divider */}
            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Continue with
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <KakaoLoginComponent />
          </div>

          {/* Footer & Link */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 font-medium">
              아직 계정이 없으신가요?{" "}
              <button
                onClick={() => moveToPath("/member/join")}
                className="text-blue-600 hover:underline font-black ml-1"
              >
                회원가입 요청하기
              </button>
            </p>
            <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
              © {new Date().getFullYear()} InsightMarket. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
