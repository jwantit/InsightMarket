import { Settings } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import BrandPermissionsComponent from "../../components/admin/brand-permissions/BrandPermissionsComponent";

const AdminBrandPermissionsPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={Settings}
        title="브랜드 권한 관리"
        breadcrumb="Admin / Brand Permissions"
        subtitle="사용자별 브랜드 접근 권한을 관리하고 제어할 수 있습니다."
      />
      <BrandPermissionsComponent />
    </div>
  );
};

export default AdminBrandPermissionsPage;
