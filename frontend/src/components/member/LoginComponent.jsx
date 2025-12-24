// import { useState } from "react";
// import useCustomLogin from "../../hooks/useCustomLogin";
// import KakaoLoginComponent from "./KakaoLoginComponent";

// const initState = {
//   email: "",
//   pw: "",
// };

// const LoginComponent = () => {
//   const [loginParam, setLoginParam] = useState({ ...initState });

//   const { doLogin, moveToPath } = useCustomLogin();

//   const handleChange = (e) => {
//     loginParam[e.target.name] = e.target.value;

//     setLoginParam({ ...loginParam });
//   };

//   const handleClickLogin = (e) => {
//     doLogin(loginParam) // loginSlice의 비동기 호출
//       .then((data) => {
//         console.log(data);
//         if (data.error) {
//           alert("이메일과 패스워드를 다시 확인하세요");
//         } else {
//           alert("로그인 성공");
//           moveToPath("/app/default");
//         }
//       });
//   };

//   return (
//     <div className="border-2 border-sky-200 mt-10 m-2 p-4">
//       <div className="flex justify-center">
//         <div className="text-4xl m-4 p-4 font-extrabold text-blue-500">
//           Login Component
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <div className="relative mb-4 flex w-full flex-wrap items-stretch">
//           <div className="w-full p-3 text-left font-bold">Email</div>
//           <input
//             className="w-full p-3 rounded-r border border-solid border-neutral-500 shadow-md"
//             name="email"
//             type={"text"}
//             value={loginParam.email}
//             onChange={handleChange}
//           ></input>
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <div className="relative mb-4 flex w-full flex-wrap items-stretch">
//           <div className="w-full p-3 text-left font-bold">Password</div>
//           <input
//             className="w-full p-3 rounded-r border border-solid border-neutral-500 shadow-md"
//             name="pw"
//             type={"password"}
//             value={loginParam.pw}
//             onChange={handleChange}
//           ></input>
//         </div>
//       </div>
//       <div className="flex justify-center">
//         <div className="relative mb-4 flex w-full justify-center">
//           <div className="w-2/5 p-6 flex justify-center font-bold">
//             <button
//               className="rounded p-4 w-36 bg-blue-500 text-xl  text-white"
//               onClick={handleClickLogin}
//             >
//               LOGIN
//             </button>
//           </div>
//         </div>
//       </div>
//       <KakaoLoginComponent />
//     </div>
//   );
// };

// export default LoginComponent;

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
    doLogin(loginParam).then((data) => {
      if (!data?.accessToken) {
        alert("이메일과 비밀번호를 다시 확인하세요.");
        return;
      }
      moveToPath("/app/default");
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
