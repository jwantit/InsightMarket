import { useEffect, useState } from "react";
import { getPendingMembers, approveMember } from "../../api/memberApi";

const PendingMembersComponent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getPendingMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("승인 대기 회원 조회 실패");
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
      alert("승인 실패");
    }
  };

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">가입 승인 요청</h2>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-xl border p-4 text-gray-500">로딩 중...</div>
        )}

        {!loading && members.length === 0 && (
          <div className="rounded-xl border p-4 text-gray-500">
            승인 대기 중인 회원이 없습니다.
          </div>
        )}

        {!loading &&
          members.map((m) => (
            <div
              key={m.memberId}
              className="rounded-xl border p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-500">{m.email}</p>
              </div>

              <button
                onClick={() => handleApprove(m.memberId)}
                className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                승인
              </button>
            </div>
          ))}
      </div>
    </section>
  );
};

export default PendingMembersComponent;
