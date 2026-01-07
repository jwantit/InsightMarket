import { Settings } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const AdminSystem = () => (
  <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
    <PageHeader
      icon={Settings}
      title="시스템 설정"
      breadcrumb="Admin / System"
      subtitle="시스템 전반의 설정을 관리할 수 있습니다."
    />
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
      <p className="text-slate-500">시스템 설정 기능이 준비 중입니다.</p>
    </div>
  </div>
);
export default AdminSystem;
