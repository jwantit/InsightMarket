import { useState } from "react";
import { joinMember, getCompanies } from "../../api/memberApi";
import useCustomLogin from "../../hooks/useCustomLogin";

const initState = {
  name: "",
  email: "",
  password: "",
  joinType: "NEW_COMPANY", // NEW_COMPANY or JOIN_COMPANY
  companyName: "",
  requestedCompanyId: "",
};

const JoinComponent = () => {
  const [joinParam, setJoinParam] = useState({ ...initState });
  const [companies, setCompanies] = useState([]);

  const { moveToLogin } = useCustomLogin();

  // 회사 목록 로딩 (JOIN_COMPANY용)
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
      console.log("companies raw:", data);
    } catch (e) {
      console.error("회사 목록 조회 실패", e);
    }
  };

  const handleChange = (e) => {
    setJoinParam({
      ...joinParam,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      // 유효성 체크
      if (!joinParam.name || !joinParam.email || !joinParam.password) {
        alert("이름, 이메일, 비밀번호는 필수입니다.");
        return;
      }
      if (joinParam.joinType === "NEW_COMPANY" && !joinParam.companyName) {
        alert("새 회사명을 입력해주세요.");
        return;
      }
      if (
        joinParam.joinType === "JOIN_COMPANY" &&
        !joinParam.requestedCompanyId
      ) {
        alert("가입할 회사를 선택해주세요.");
        return;
      }

      const res = await joinMember(joinParam);
      alert("회원가입 요청이 완료되었습니다!");
      setJoinParam({ ...initState });

      moveToLogin();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "회원가입 실패");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
      <h2 className="text-center text-2xl font-bold mb-6">회원가입</h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">이름</label>
        <input
          className="w-full border rounded px-3 py-2"
          name="name"
          value={joinParam.name}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">이메일</label>
        <input
          className="w-full border rounded px-3 py-2"
          name="email"
          type="email"
          value={joinParam.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">비밀번호</label>
        <input
          className="w-full border rounded px-3 py-2"
          name="password"
          type="password"
          value={joinParam.password}
          onChange={handleChange}
        />
      </div>

      {/* 가입 유형 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">가입 유형</label>
        <select
          name="joinType"
          value={joinParam.joinType}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="NEW_COMPANY">새 회사 생성</option>
          <option value="JOIN_COMPANY">기존 회사 가입</option>
        </select>
      </div>

      {/* NEW_COMPANY일 때 회사명 입력 */}
      {joinParam.joinType === "NEW_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">회사명</label>
          <input
            name="companyName"
            value={joinParam.companyName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      {/* JOIN_COMPANY일 때 회사 선택 */}
      {joinParam.joinType === "JOIN_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">회사 선택</label>
          <select
            name="requestedCompanyId"
            value={joinParam.requestedCompanyId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            onFocus={fetchCompanies}
          >
            <option value="">-- 선택 --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        가입
      </button>
    </div>
  );
};

export default JoinComponent;
