import { useEffect, useMemo, useState } from "react";
import { getAdminMembers } from "../../../api/adminApi";

const cx = (...arr) => arr.filter(Boolean).join(" ");

const MemberSearchModal = ({
  open,
  onClose,
  onSelect,
  excludeIds = [], // 이미 브랜드에 있는 memberId들
}) => {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAdminMembers(keyword ? { keyword } : {});
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("멤버 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setMembers([]);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl border overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">회사 멤버 검색</h3>
            <p className="text-xs text-gray-500 mt-1">
              이름 또는 이메일로 검색해서 멤버를 선택하세요.
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름 또는 이메일"
              className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
            />
            <button
              onClick={load}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              검색
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border p-4 text-sm text-gray-500">
              로딩 중...
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {members.map((m) => {
                const already = excludeSet.has(m.memberId);
                const disabled = already || m.isExpired;

                return (
                  <div
                    key={m.memberId}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="truncate">{m.name}</span>
                        {m.isExpired && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            탈퇴
                          </span>
                        )}
                        {already && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            이미 추가됨
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {m.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        권한 : {m.role}
                      </div>
                    </div>

                    <button
                      disabled={disabled}
                      onClick={() => onSelect(m)}
                      className={cx(
                        "rounded-lg px-3 py-2 text-sm font-semibold",
                        disabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-black"
                      )}
                    >
                      선택
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm border hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberSearchModal;
