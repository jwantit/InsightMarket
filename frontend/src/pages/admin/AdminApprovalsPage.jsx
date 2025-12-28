import PendingMembersComponent from "../../components/admin/approvals/PendingMembersComponent";

const AdminApprovalsPage = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            가입 승인
          </h1>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6">
          <PendingMembersComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalsPage;
