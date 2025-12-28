import AdminUsersComponent from "../../components/admin/users/AdminUsersComponent";

const AdminUsersPage = () => {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6">
          <h1 className="text-xl font-bold">사용자 계정 관리</h1>
          <AdminUsersComponent />
        </div>
      </div>
    );
  };
  
export default AdminUsersPage;
  