import { Settings } from "lucide-react";
import BrandPermissionsComponent from "../../components/admin/brand-permissions/BrandPermissionsComponent";

const AdminBrandPermissionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              브랜드 권한 관리
            </h1>
            <p className="text-sm text-slate-500">
              브랜드 멤버의 권한을 관리합니다.
            </p>
          </div>
        </div>
      </div>

      <BrandPermissionsComponent />
    </div>
  );
};

export default AdminBrandPermissionsPage;
  