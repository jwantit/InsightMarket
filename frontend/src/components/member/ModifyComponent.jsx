import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Lock,
  Building2,
  AlertCircle,
  Save,
  X,
  Shield,
} from "lucide-react";
import { modifyMember } from "../../api/memberApi";
import { getCompanies } from "../../api/companyApi";
import useCustomLogin from "../../hooks/login/useCustomLogin";
import ResultModal from "../common/ResultModal";
import { showAlert } from "../../hooks/common/useAlert";

const Pill = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100 ${className}`}
  >
    {children}
  </span>
);

const Label = ({ children }) => (
  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
    {children}
  </p>
);

const Input = (props) => (
  <input
    {...props}
    className={[
      "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium",
      "outline-none transition-all",
      "focus:ring-4 focus:ring-blue-50 focus:border-blue-500",
      "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
      props.className || "",
    ].join(" ")}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={[
      "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium",
      "outline-none transition-all appearance-none",
      "focus:ring-4 focus:ring-blue-50 focus:border-blue-500",
      "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
      props.className || "",
    ].join(" ")}
  />
);

const FieldCard = ({ title, children, desc, icon: Icon }) => (
  <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
      {Icon && (
        <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {desc ? <p className="mt-0.5 text-xs text-slate-500">{desc}</p> : null}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between hover:bg-white transition-colors">
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {Icon && <Icon size={16} className="text-slate-400" />}
      <span className="font-medium">{label}</span>
    </div>
    <div className="text-sm font-bold text-slate-900">{value ?? "-"}</div>
  </div>
);

const ModifyComponent = () => {
  const loginInfo = useSelector((state) => state.loginSlice);
  const { moveToPath } = useCustomLogin();
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const isSocial = loginInfo?.isSocial || false;
  const isApproved = loginInfo?.isApproved || false;
  const hasCompany = loginInfo?.companyId != null;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [requestedCompanyId, setRequestedCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);

  const email = loginInfo?.email ?? "";
  const role = loginInfo?.role ?? "";

  // loginInfo가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loginInfo || !loginInfo.email) {
      moveToPath("/member/login");
    }
  }, [loginInfo, moveToPath]);

  useEffect(() => {
    if (loginInfo) {
      setName(loginInfo.name || "");
      setRequestedCompanyId(loginInfo.requestedCompanyId || "");
    }
  }, [loginInfo]);

  // 로딩 중이거나 loginInfo가 없으면 아무것도 렌더링하지 않음
  if (!loginInfo || !loginInfo.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (e) {
      console.error("회사 목록 조회 실패", e);
    }
  };

  const validate = async () => {
    if (!name.trim()) {
      await showAlert("이름을 입력해주세요.", "warning");
      return false;
    }

    // 소셜 로그인 사용자는 비밀번호 필수
    if (isSocial) {
      if (!password || !password2) {
        await showAlert("비밀번호를 입력해주세요.", "warning");
        return false;
      }
      if (password.length < 4) {
        await showAlert("비밀번호는 4자 이상으로 입력해주세요.", "warning");
        return false;
      }
      if (password !== password2) {
        await showAlert("비밀번호가 일치하지 않습니다.", "warning");
        return false;
      }
    } else {
      // 일반 사용자는 비밀번호 선택사항이지만 입력한 경우 검증
      if (password || password2) {
        if (password.length < 4) {
          await showAlert("비밀번호는 4자 이상으로 입력해주세요.", "warning");
          return false;
        }
        if (password !== password2) {
          await showAlert("비밀번호가 일치하지 않습니다.", "warning");
          return false;
        }
      }
    }

    // 소셜 로그인 사용자이고 아직 회사가 없으면 회사 선택 필수
    if (isSocial && !hasCompany && !isApproved && !requestedCompanyId) {
      await showAlert("가입할 회사를 선택해주세요.", "warning");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!(await validate())) return;

    setSaving(true);
    try {
      const payload = {
        email,
        name: name.trim(),
        ...(password ? { password } : {}),
        ...(isSocial && !hasCompany && !isApproved && requestedCompanyId
          ? { requestedCompanyId: Number(requestedCompanyId) }
          : {}),
      };

      await modifyMember(payload);

      setResult("Modified");
    } catch (e) {
      console.error(e);
      await showAlert("정보 수정에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setResult(null);
    moveToPath("/app");
  };

  const initials = (loginInfo?.name || email || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <section className="space-y-6 max-w-4xl mx-auto p-6">
      {result ? (
        <ResultModal
          title={"회원정보"}
          content={"정보수정완료"}
          callbackFn={closeModal}
        />
      ) : null}

      {/* Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center font-black text-2xl shadow-lg shadow-blue-200">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xl font-black text-slate-900">
                    {loginInfo?.name || "이름 없음"}
                  </p>
                  <Pill>{role || "ROLE"}</Pill>
                  {isSocial && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                      소셜 로그인
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} />
                  <span>{email || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 소셜 로그인 사용자 안내 */}
      {isSocial && (
        <FieldCard
          title="비밀번호 설정 안내"
          desc="보안을 위해 비밀번호를 설정해주세요"
          icon={AlertCircle}
        >
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-blue-600 mt-0.5 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900 mb-1">
                  비밀번호를 변경해주세요
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  소셜 로그인으로 가입하신 경우 보안을 위해 비밀번호를
                  설정해주세요. 비밀번호를 설정하지 않으면 소셜 로그인으로만
                  접속할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </FieldCard>
      )}

      {/* Basic Info */}
      <FieldCard title="기본 정보" desc="계정의 기본 정보입니다." icon={User}>
        <div>
          <Label>이름</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            placeholder="이름을 입력하세요"
          />
          <p className="mt-2 text-xs text-slate-400">
            화면에 표시되는 이름입니다.
          </p>
        </div>

        <div>
          <Label>이메일</Label>
          <Input value={email} disabled />
          <p className="mt-2 text-xs text-slate-400">
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        <div>
          <Label>권한</Label>
          <Input value={role} disabled />
          <p className="mt-2 text-xs text-slate-400">
            권한은 관리자에게 문의하세요.
          </p>
        </div>
      </FieldCard>

      {/* 비밀번호 변경 */}
      <FieldCard
        title="비밀번호 변경"
        desc={
          isSocial
            ? "비밀번호를 입력해주세요. (필수)"
            : "비밀번호를 변경하려면 아래 필드를 입력하세요. (선택사항)"
        }
        icon={Lock}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
          <div>
            <Label>
              새 비밀번호{" "}
              {isSocial && (
                <>
                  <span className="text-red-500">*</span>{" "}
                  <span className="text-blue-600">(필수)</span>
                </>
              )}
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving}
              placeholder="새 비밀번호"
              required={isSocial}
            />
            <p className="mt-2 text-xs text-slate-400">
              {isSocial
                ? "4자 이상 입력해주세요."
                : "4자 이상 입력해주세요. 비워두면 변경하지 않습니다."}
            </p>
          </div>

          {(password || isSocial) && (
            <div>
              <Label>
                새 비밀번호 확인{" "}
                {isSocial && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={saving}
                placeholder="새 비밀번호 확인"
                required={isSocial}
              />
              <p className="mt-2 text-xs text-slate-400">
                위 비밀번호와 동일하게 입력해주세요.
              </p>
            </div>
          )}
        </div>
      </FieldCard>

      {/* 회사 선택 - 소셜 로그인 사용자이고 아직 회사가 없을 때만 */}
      {isSocial && !hasCompany && !isApproved && (
        <FieldCard
          title="회사 선택"
          desc="가입할 회사를 선택해주세요. (필수)"
          icon={Building2}
        >
          <div>
            <Label>
              회사 선택 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Building2 size={18} className="text-slate-400" />
              </div>
              <Select
                value={requestedCompanyId}
                onChange={(e) => setRequestedCompanyId(e.target.value)}
                onFocus={fetchCompanies}
                disabled={saving}
                className="pl-12"
              >
                <option value="">-- 선택 --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              가입할 회사를 선택해주세요. 선택한 회사의 관리자 승인 후 가입이
              완료됩니다.
            </p>
          </div>
        </FieldCard>
      )}

      {/* 이미 회사에 가입된 경우 정보 표시 */}
      {isSocial && (hasCompany || isApproved) && (
        <FieldCard
          title="회사 정보"
          desc="현재 가입된 회사 정보입니다"
          icon={Building2}
        >
          <InfoRow
            label="회사"
            value={loginInfo?.companyName || "승인 대기 중"}
            icon={Building2}
          />
          <p className="mt-2 text-xs text-slate-400">
            {isApproved
              ? "회사 가입이 완료되었습니다."
              : "회사 관리자의 승인을 기다리고 있습니다."}
          </p>
        </FieldCard>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              저장 중...
            </>
          ) : (
            <>
              <Save size={18} />
              저장
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default ModifyComponent;
