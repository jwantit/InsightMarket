import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="flex">
        <SideBar />
        <main className="flex-1 p-3 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
