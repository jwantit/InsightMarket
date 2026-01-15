const ROLE_OPTIONS = [
    { value: "BRAND_ADMIN", label: "브랜드 관리자" },
    { value: "MARKETER", label: "마케터" },
  ];
  
  const cx = (...arr) => arr.filter(Boolean).join(" ");
  
  const BrandMemberListComponent = ({
    loading,
    members,
    busyId,
    onRefresh,
    onChangeRole,
    onRemove,
  }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              등록된 멤버가 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              상단의 멤버 추가를 통해 멤버를 추가하세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">현재 브랜드 멤버</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            브랜드에 등록된 멤버 목록입니다.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
        >
          새로고침
        </button>
      </div>

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
                역할
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
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {m.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{m.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={m.brandRole}
                    disabled={busyId === m.memberId}
                    onChange={(e) => onChangeRole(m.memberId, e.target.value)}
                    className={cx(
                      "px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none transition-all",
                      busyId === m.memberId
                        ? "opacity-60 cursor-not-allowed"
                        : "focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                    )}
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onRemove(m.memberId)}
                    disabled={busyId === m.memberId}
                    className={cx(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      busyId === m.memberId
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    )}
                  >
                    제거
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
  
  export default BrandMemberListComponent;
  