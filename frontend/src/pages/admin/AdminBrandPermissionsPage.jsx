import BrandPermissionsComponent from "../../components/admin/brand-permissions/BrandPermissionsComponent";

const AdminBrandPermissionsPage = () => {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6">
          <h1 className="text-xl font-bold">브랜드 권한 관리</h1>
          <BrandPermissionsComponent />
        </div>
      </div>
    );
  };
  
  export default AdminBrandPermissionsPage;
  