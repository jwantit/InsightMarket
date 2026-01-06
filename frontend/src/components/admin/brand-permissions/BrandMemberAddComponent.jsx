import { useMemo, useState } from "react";
import MemberSearchModal from "./MemberSearchModal";

const ROLE_OPTIONS = [
  { value: "BRAND_ADMIN", label: "브랜드 관리자" },
  { value: "MARKETER", label: "마케터" },
];

const cx = (...arr) => arr.filter(Boolean).join(" ");

const BrandMemberAddComponent = ({
  onAdd,
  adding,
  existingMemberIds = [], // 현재 브랜드 멤버 memberId 목록
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null); // { memberId, name, email, ... }
  const [brandRole, setBrandRole] = useState("MARKETER");

  const canAdd = useMemo(() => {
    return !!selected?.memberId && !adding;
  }, [selected, adding]);

  const handleSelect = (member) => {
    setSelected(member);
    setOpenModal(false);
  };

  const handleSubmit = async () => {
    if (!canAdd) return;
    await onAdd({ memberId: selected.memberId, brandRole });
    setSelected(null);
    setBrandRole("MARKETER");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">멤버 추가</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          브랜드에 새로운 멤버를 추가합니다.
        </p>
      </div>
      <div className="p-6">

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_120px] gap-3 items-end">
          {/* 멤버 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              멤버
            </label>

            {selected ? (
              <div className="h-12 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {selected.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {selected.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenModal(true)}
                  className="ml-3 shrink-0 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                멤버 검색해서 선택
              </button>
            )}
          </div>

          {/* 역할 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
              역할
            </label>
            <select
              value={brandRole}
              onChange={(e) => setBrandRole(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 추가 버튼 */}
          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdd}
              className={cx(
                "h-12 w-full rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95",
                !canAdd
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              )}
            >
              {adding ? "추가 중..." : "추가"}
            </button>
          </div>
        </div>
      </div>

      <MemberSearchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelect={handleSelect}
        excludeIds={existingMemberIds}
      />
    </div>
  );
};

export default BrandMemberAddComponent;
