import { Users } from "lucide-react";
import AdminUsersComponent from "../../components/admin/users/AdminUsersComponent";

const AdminUsersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              사용자 계정 관리
            </h1>
            <p className="text-sm text-slate-500">
              회사 내 모든 사용자 계정을 관리합니다.
            </p>
          </div>
        </div>
      </div>

      <AdminUsersComponent />
    </div>
  );
};

export default AdminUsersPage;
  