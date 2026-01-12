import { useEffect, useMemo, useState } from "react";
import { useBrand } from "../../../hooks/brand/useBrand";
import {
  addBrandMember,
  getBrandMembers,
  removeBrandMember,
  updateBrandMemberRole,
} from "../../../api/brandMemberApi";
import BrandMemberAddComponent from "./BrandMemberAddComponent";
import BrandMemberListComponent from "./BrandMemberListComponent";
import { confirmAlert, showAlert } from "../../../hooks/common/useAlert";

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
      await showAlert("브랜드 멤버 목록 조회에 실패했습니다.", "error");
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
      await showAlert("멤버가 추가되었습니다.", "success");
      await reload();
    } catch (e) {
      console.error(e);
      await showAlert("멤버 추가에 실패했습니다. (이미 포함/권한/회사 불일치 등)", "error");
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
      await showAlert("역할 변경에 실패했습니다.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (memberId) => {
    if (!brandId) return;
    const confirmed = await confirmAlert("정말 이 멤버를 브랜드에서 제거하시겠습니까?");
    if (!confirmed) return;

    setBusyId(memberId);
    try {
      await removeBrandMember(brandId, memberId);
      setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
    } catch (e) {
      console.error(e);
      await showAlert("멤버 제거에 실패했습니다.", "error");
    } finally {
      setBusyId(null);
    }
  };

  if (!brandId) return null;

  return (
    <div className="space-y-6">
      <BrandMemberAddComponent
        onAdd={handleAdd}
        adding={adding}
        existingMemberIds={members.map((m) => m.memberId)}
      />

      <BrandMemberListComponent
        loading={loading}
        members={sortedMembers}
        busyId={busyId}
        onRefresh={reload}
        onChangeRole={handleRoleChange}
        onRemove={handleRemove}
      />
    </div>
  );
};

export default BrandPermissionsComponent;
