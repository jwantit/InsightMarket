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
    return (
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">현재 브랜드 멤버</h2>
            <button
              onClick={onRefresh}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              새로고침
            </button>
          </div>
        </div>
  
        {loading ? (
          <div className="p-6 text-sm text-gray-500">불러오는 중...</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">등록된 멤버가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-4 sm:px-6 py-3">이름</th>
                  <th className="text-left font-semibold px-4 sm:px-6 py-3">이메일</th>
                  <th className="text-left font-semibold px-4 sm:px-6 py-3">역할</th>
                  <th className="text-right font-semibold px-4 sm:px-6 py-3">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((m) => (
                  <tr key={m.memberId} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                      {m.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gray-700">{m.email}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <select
                        value={m.brandRole}
                        disabled={busyId === m.memberId}
                        onChange={(e) => onChangeRole(m.memberId, e.target.value)}
                        className={cx(
                          "rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                          busyId === m.memberId
                            ? "opacity-60 cursor-not-allowed"
                            : "focus:ring-2 focus:ring-blue-200"
                        )}
                      >
                        {ROLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <button
                        onClick={() => onRemove(m.memberId)}
                        disabled={busyId === m.memberId}
                        className={cx(
                          "rounded-lg px-3 py-2 text-sm font-semibold transition",
                          busyId === m.memberId
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
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
        )}
      </div>
    );
  };
  
  export default BrandMemberListComponent;
  