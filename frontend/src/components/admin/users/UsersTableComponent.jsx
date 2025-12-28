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
        <div className="rounded-xl border p-4 text-gray-500">
          로딩 중...
        </div>
      );
    }
  
    if (!members.length) {
      return (
        <div className="rounded-xl border p-4 text-gray-500">
          조회된 멤버가 없습니다.
        </div>
      );
    }
  
    return (
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">이름</th>
              <th className="px-4 py-3 text-left font-semibold">이메일</th>
              <th className="px-4 py-3 text-left font-semibold">권한</th>
              <th className="px-4 py-3 text-center font-semibold">상태</th>
              <th className="px-4 py-3 text-right font-semibold">관리</th>
            </tr>
          </thead>
  
          <tbody className="divide-y">
            {members.map((m) => (
              <tr
                key={m.memberId}
                className={m.expired ? "bg-gray-50 text-gray-400" : ""}
              >
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.email}</td>
  
                <td className="px-4 py-3">
                  <select
                    value={m.role}
                    disabled={m.expired}
                    onChange={(e) =>
                      onChangeRole(m.memberId, e.target.value)
                    }
                    className="rounded-lg border px-2 py-1 text-sm
                               disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </td>
  
                <td className="px-4 py-3 text-center">
                  {m.expired ? (
                    <span className="text-xs font-semibold text-red-500">
                      탈퇴
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-green-600">
                      활성
                    </span>
                  )}
                </td>
  
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onExpire(m.memberId, !m.expired)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold
                      ${
                        m.expired
                          ? "bg-gray-200 hover:bg-gray-300"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                  >
                    {m.expired ? "복구" : "탈퇴"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default UsersTableComponent;
  