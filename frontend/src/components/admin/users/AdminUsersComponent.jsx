import { useEffect, useState } from "react";
import {
  getAdminMembers,
  updateMemberRole,
  updateMemberExpired,
} from "../../../api/adminApi";

import UsersTableComponent from "./UsersTableComponent";
import { confirmAlert, showAlert } from "../../../hooks/common/useAlert";

const AdminUsersComponent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getAdminMembers(
        keyword ? { keyword } : {}
      );
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      await showAlert("회사 멤버 조회 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSearch = () => {
    loadMembers();
  };

  const handleChangeRole = async (memberId, role) => {
    try {
      await updateMemberRole(memberId, role);
      loadMembers();
    } catch {
      await showAlert("권한 변경 실패", "error");
    }
  };

  const handleExpire = async (memberId, expired) => {
    const confirmed = await confirmAlert(expired ? "탈퇴 처리하시겠습니까?" : "복구하시겠습니까?");
    if (!confirmed) return;

    try {
        console.log("탈퇴로그:" , memberId, expired)
      await updateMemberExpired(memberId, expired);
      loadMembers();
    } catch {
      await showAlert("탈퇴 처리 실패", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <div className="flex gap-3">
          <div className="relative group flex-1">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="이름 또는 이메일로 검색"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            검색
          </button>
        </div>
      </div>

      {/* Table */}
      <UsersTableComponent
        loading={loading}
        members={members}
        onChangeRole={handleChangeRole}
        onExpire={handleExpire}
      />
    </div>
  );
};

export default AdminUsersComponent;
