import { useEffect, useMemo, useState } from "react";
import { getAdminMembers } from "../../../api/adminApi";
import { showAlert } from "../../../hooks/common/useAlert";

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
      await showAlert("멤버 조회 실패", "error");
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
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">회사 멤버 검색</h3>
            <p className="text-xs text-slate-500 mt-1">
              이름 또는 이메일로 검색해서 멤버를 선택하세요.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="이름 또는 이메일"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter") load();
              }}
            />
            <button
              onClick={load}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              검색
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-xl animate-pulse" />
                <p className="text-sm text-slate-500">로딩 중...</p>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {members.map((m) => {
                const already = excludeSet.has(m.memberId);
                const disabled = already || m.isExpired;

                return (
                  <div
                    key={m.memberId}
                    className="flex items-center justify-between p-4 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                        <span className="truncate">{m.name}</span>
                        {m.isExpired && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold uppercase">
                            탈퇴
                          </span>
                        )}
                        {already && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase">
                            이미 추가됨
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {m.email}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        권한: {m.role}
                      </div>
                    </div>

                    <button
                      disabled={disabled}
                      onClick={() => onSelect(m)}
                      className={cx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        disabled
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95"
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

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberSearchModal;
