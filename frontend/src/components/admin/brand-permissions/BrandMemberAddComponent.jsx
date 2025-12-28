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
    <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6 mb-4">
      <h2 className="text-sm font-bold text-gray-900 mb-3">멤버 추가</h2>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px_96px] gap-3 items-end">
        {/* 멤버 선택 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            멤버
          </label>

          {selected ? (
            <div className="h-11 flex items-center justify-between rounded-lg border bg-gray-50 px-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {selected.name}{" "}                
                  <span className="ml-2 text-xs font-normal text-gray-500 truncate">
                    {selected.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="ml-3 shrink-0 text-sm text-gray-500 hover:text-gray-900"
              >
                변경
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              멤버 검색해서 선택
            </button>
          )}
        </div>

        {/* 역할 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            역할
          </label>
          <select
            value={brandRole}
            onChange={(e) => setBrandRole(e.target.value)}
            className="h-11 w-full rounded-lg border bg-gray-50 px-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 추가 버튼 */}
        <div className="sm:pl-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdd}
            className={cx(
              "h-11 w-full rounded-lg text-sm font-semibold text-white transition",
              !canAdd
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {adding ? "추가 중..." : "추가"}
          </button>
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
