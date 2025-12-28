import { useEffect, useMemo, useState } from "react";
import { useBrand } from "../../../hooks/useBrand";
import {
  addBrandMember,
  getBrandMembers,
  removeBrandMember,
  updateBrandMemberRole,
} from "../../../api/brandMemberApi";
import BrandMemberAddComponent from "./BrandMemberAddComponent";
import BrandMemberListComponent from "./BrandMemberListComponent";

const BrandPermissionsComponent = () => {
  const { brandId } = useBrand();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  const [busyId, setBusyId] = useState(null); // row 단위 busy
  const [adding, setAdding] = useState(false);

  const reload = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const data = await getBrandMembers(brandId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("브랜드 멤버 목록 조회에 실패했습니다.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const ra = a.brandRole === "BRAND_ADMIN" ? 0 : 1;
      const rb = b.brandRole === "BRAND_ADMIN" ? 0 : 1;
      return ra - rb;
    });
  }, [members]);

  const handleAdd = async ({ memberId, brandRole }) => {
    if (!brandId) return;
    setAdding(true);
    try {
      await addBrandMember(brandId, { memberId, brandRole });
      alert("멤버가 추가되었습니다.");
      await reload();
    } catch (e) {
      console.error(e);
      alert("멤버 추가에 실패했습니다. (이미 포함/권한/회사 불일치 등)");
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (memberId, nextRole) => {
    if (!brandId) return;
    setBusyId(memberId);
    try {
      await updateBrandMemberRole(brandId, memberId, { brandRole: nextRole });
      setMembers((prev) =>
        prev.map((m) => (m.memberId === memberId ? { ...m, brandRole: nextRole } : m))
      );
    } catch (e) {
      console.error(e);
      alert("역할 변경에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (memberId) => {
    if (!brandId) return;
    if (!window.confirm("정말 이 멤버를 브랜드에서 제거할까요?")) return;

    setBusyId(memberId);
    try {
      await removeBrandMember(brandId, memberId);
      setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
    } catch (e) {
      console.error(e);
      alert("멤버 제거에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  if (!brandId) return null;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl">
        <BrandMemberAddComponent
          onAdd={handleAdd} adding={adding} existingMemberIds={members.map((m) => m.memberId)} />

        <BrandMemberListComponent
          loading={loading}
          members={sortedMembers}
          busyId={busyId}
          onRefresh={reload}
          onChangeRole={handleRoleChange}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
};

export default BrandPermissionsComponent;
