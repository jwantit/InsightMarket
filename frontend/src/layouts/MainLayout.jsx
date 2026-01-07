import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";
import useMyBrands from "../hooks/useMyBrands";

const MainLayout = () => {
  const { brands, loading } = useMyBrands();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-4" />
          <div className="h-2 w-24 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TopBar brands={brands} />
      <div className="flex max-w-[1920px] mx-auto">
        <SideBar />
        <main className="flex-1 p-6 lg:p-8 min-w-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
