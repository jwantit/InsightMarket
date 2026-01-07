import { ShieldCheck } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import PendingMembersComponent from "../../components/admin/approvals/PendingMembersComponent";

const AdminApprovalsPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={ShieldCheck}
        title="가입 승인"
        breadcrumb="Admin / Approvals"
        subtitle="새로운 사용자의 가입 요청을 검토하고 승인할 수 있습니다."
      />
      <PendingMembersComponent />
    </div>
  );
};

export default AdminApprovalsPage;
