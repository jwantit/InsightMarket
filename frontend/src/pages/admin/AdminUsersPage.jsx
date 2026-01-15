import { Users } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import AdminUsersComponent from "../../components/admin/users/AdminUsersComponent";

const AdminUsersPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={Users}
        title="사용자 계정 관리"
        breadcrumb="Admin / Users"
        subtitle="시스템에 등록된 모든 사용자 계정을 관리하고 권한을 제어할 수 있습니다."
      />
      <AdminUsersComponent />
    </div>
  );
};

export default AdminUsersPage;
