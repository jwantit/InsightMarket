// import useCustomLogin from "../../hooks/useCustomLogin";

// const NoBrandPage = () => {

//   const { doLogout, moveToPath } = useCustomLogin();

//   const handleClickLogout = () => {
//     doLogout();
//     alert("로그아웃되었습니다.");
//     moveToPath("/");
//   };

//   return (
//     <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8 text-center">
//         <h1 className="text-xl font-bold text-gray-900">접근 가능한 브랜드가 없습니다</h1>
//         <p className="mt-2 text-sm text-gray-500">
//           관리자에게 브랜드 권한을 요청해주세요.
//         </p>

//         <button
//           className="mt-6 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-black"
//           onClick={handleClickLogout}
//         >
//           로그아웃
//         </button>
//       </div>
//     </div>
//   );
// };

// export default NoBrandPage;
