import { useEffect, useState } from "react";
import { CheckCircle2, User, Mail } from "lucide-react";
import { approveMember, getPendingApprovals } from "../../../api/adminApi";
import { showAlert } from "../../../hooks/common/useAlert";

const PendingMembersComponent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getPendingApprovals();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      await showAlert("승인 대기 회원 조회 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleApprove = async (memberId) => {
    try {
      await approveMember(memberId);
      loadMembers();
    } catch {
      await showAlert("승인 실패", "error");
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <p className="text-sm text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <User size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              승인 대기 중인 회원이 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              새로운 가입 요청이 있으면 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">승인 대기 회원</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {members.map((m) => (
          <div
            key={m.memberId}
            className="p-6 flex items-center justify-between hover:bg-blue-50/30 transition-colors group"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900">{m.name}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} />
                  <span>{m.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleApprove(m.memberId)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              <CheckCircle2 size={18} />
              승인
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingMembersComponent;
