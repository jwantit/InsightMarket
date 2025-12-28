import { useState } from "react";
import useCustomLogin from "../../hooks/useCustomLogin";
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
    <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <div className="text-2xl font-extrabold tracking-tight">
          Insight<span className="text-blue-600">Market</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          브랜드 인사이트를 한 곳에서 관리하세요
        </p>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          이메일
        </label>
        <input
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
          name="email"
          type="text"
          placeholder="user@example.com"
          value={loginParam.email}
          onChange={handleChange}
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
          name="pw"
          type="password"
          placeholder="••••••••"
          value={loginParam.pw}
          onChange={handleChange}
        />
      </div>

      {/* Login Button */}
      <button
        onClick={handleClickLogin}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        로그인
      </button>

      {/* 회원가입 이동 */}
      <div className="mt-4 text-center">
        <button
          onClick={() => moveToPath("/member/join")}
          className="text-sm text-blue-600 hover:underline"
        >
          아직 계정이 없으신가요? 회원가입
        </button>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <KakaoLoginComponent />

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} InsightMarket
      </div>
    </div>
  );
};

export default LoginComponent;
