import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="flex">
        <SideBar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
