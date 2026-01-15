import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import useMyBrands from "../hooks/brand/useMyBrands";

const MainLayout = () => {
  const { brands, loading } = useMyBrands();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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
      <TopBar brands={brands} onToggleSidebar={toggleSidebar} />
      <div className="flex max-w-[1920px] mx-auto relative">
        <SideBar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
        
        {/* 1440px 이하에서 사이드바가 열렸을 때 배경 오버레이 */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 z-[55] min-[1441px]:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
