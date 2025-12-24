// import LoginComponent from "../../components/member/LoginComponent";

// const LoginPage = () => {
//   return (
//     <div className="fixed top-0 left-0 z-[1055] flex flex-col h-full w-full">
//       <div className="w-full flex flex-wrap  h-full justify-center  items-center border-2">
//         <LoginComponent />
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import LoginComponent from "../../components/member/LoginComponent";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <LoginComponent />
    </div>
  );
};

export default LoginPage;
