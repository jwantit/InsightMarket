import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";
import useMyBrands from "../hooks/useMyBrands";

const MainLayout = () => {

  const { brands, loading } = useMyBrands();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar brands={brands}/>
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
