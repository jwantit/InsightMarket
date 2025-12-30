import { useState } from "react";
import { joinMember } from "../../api/memberApi";
import { getCompanies } from "../../api/companyApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import { getErrorMessage } from "../../util/errorUtil";

const initState = {
  name: "",
  email: "",
  password: "",
  joinType: "NEW_COMPANY",
  companyName: "",
  requestedCompanyId: "",
};

const JoinComponent = () => {
  const [joinParam, setJoinParam] = useState({ ...initState });
  const [companies, setCompanies] = useState([]);

  const { moveToLogin } = useCustomLogin();

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      console.log("companies raw:", data);
      setCompanies(data);
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

    try {
      await joinMember(joinParam);
      alert("회원가입 요청이 완료되었습니다!");
      moveToLogin();
    } catch (e) {
      alert(getErrorMessage(e, "회원가입 실패"));
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <div className="text-2xl font-extrabold tracking-tight">
          Insight<span className="text-blue-600">Market</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          팀과 브랜드를 등록하고 시작하세요
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          이름
        </label>
        <input
          name="name"
          value={joinParam.name}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          name="email"
          value={joinParam.email}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          type="password"
          name="password"
          value={joinParam.password}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Join Type */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          가입 유형
        </label>
        <select
          name="joinType"
          value={joinParam.joinType}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
        >
          <option value="NEW_COMPANY">새 회사 생성</option>
          <option value="JOIN_COMPANY">기존 회사 가입</option>
        </select>
      </div>

      {/* Company Name */}
      {joinParam.joinType === "NEW_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            회사명
          </label>
          <input
            name="companyName"
            value={joinParam.companyName}
            onChange={handleChange}
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {/* Company Select */}
      {joinParam.joinType === "JOIN_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            회사 선택
          </label>
          <select
            name="requestedCompanyId"
            value={joinParam.requestedCompanyId}
            onChange={handleChange}
            onFocus={fetchCompanies}
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        회원가입 요청
      </button>

      {/* Login 이동 */}
      <div className="mt-4 text-center">
        <button
          onClick={moveToLogin}
          className="text-sm text-blue-600 hover:underline"
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} InsightMarket
      </div>
    </div>
  );
};

export default JoinComponent;
