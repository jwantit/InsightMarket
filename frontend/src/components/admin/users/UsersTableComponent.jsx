import { User, Mail, Shield, AlertCircle, RotateCcw } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "USER", label: "일반 사용자" },
  { value: "COMPANY_ADMIN", label: "회사 관리자" },
];

const UsersTableComponent = ({
  loading,
  members,
  onChangeRole,
  onExpire,
}) => {
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

  if (!members.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <User size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              조회된 멤버가 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              검색 조건을 변경해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                권한
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {members.map((m) => (
              <tr
                key={m.memberId}
                className={`hover:bg-blue-50/30 transition-colors ${
                  m.expired ? "opacity-60" : ""
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {m.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{m.email}</td>

                <td className="px-6 py-4">
                  <select
                    value={m.role}
                    disabled={m.expired}
                    onChange={(e) => onChangeRole(m.memberId, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-6 py-4 text-center">
                  {m.expired ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 ring-1 ring-red-200">
                      <AlertCircle size={12} />
                      탈퇴
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      활성
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onExpire(m.memberId, !m.expired)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      m.expired
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {m.expired ? (
                      <>
                        <RotateCcw size={14} />
                        복구
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        탈퇴
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
  
  export default UsersTableComponent;
  