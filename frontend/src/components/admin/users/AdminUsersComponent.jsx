import { useEffect, useState } from "react";
import {
  getAdminMembers,
  updateMemberRole,
  updateMemberExpired,
} from "../../../api/adminApi";

import UsersTableComponent from "./UsersTableComponent";

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
      alert("회사 멤버 조회 실패");
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
      alert("권한 변경 실패");
    }
  };

  const handleExpire = async (memberId, expired) => {
    if (!window.confirm(expired ? "탈퇴 처리할까요?" : "복구할까요?")) return;

    try {
        console.log("탈퇴로그:" , memberId, expired)
      await updateMemberExpired(memberId, expired);
      loadMembers();
    } catch {
      alert("탈퇴 처리 실패");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl">
        {/* Search */}
        <div className="mb-4 flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="이름 또는 이메일로 검색"
            className="w-72 rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none
                       focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm
                       hover:bg-blue-700"
          >
            검색
          </button>
        </div>

        {/* Table */}
        <UsersTableComponent
          loading={loading}
          members={members}
          onChangeRole={handleChangeRole}
          onExpire={handleExpire}
        />
      </div>
    </div>
  );
};

export default AdminUsersComponent;
