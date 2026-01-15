import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit3, X, Save, User, Mail, Shield, Lock } from "lucide-react";
import { modifyMember } from "../../api/memberApi";
import { updateProfile } from "../../store/slices/loginSlice";
import { showAlert } from "../../hooks/common/useAlert";

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
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
        {desc ? (
          <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
        ) : null}
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

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const loginInfo = useSelector((state) => state.loginSlice);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    setName(loginInfo?.name ?? "");
  }, [loginInfo?.name]);

  const email = useMemo(() => loginInfo?.email ?? "", [loginInfo?.email]);
  const role = useMemo(() => loginInfo?.role ?? "", [loginInfo?.role]);

  const initials = useMemo(() => {
    const base = (loginInfo?.name || email || "U").trim();
    return base.slice(0, 1).toUpperCase();
  }, [loginInfo?.name, email]);

  const resetForm = () => {
    setName(loginInfo?.name ?? "");
    setPassword("");
    setPassword2("");
  };

  const validate = async () => {
    if (!name.trim()) {
      await showAlert("이름을 입력해주세요.", "warning");
      return false;
    }
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
      };

      await modifyMember(payload);

      // Redux + Cookie 즉시 반영
      dispatch(updateProfile({ name: name.trim() }));

      setEditing(false);
      setPassword("");
      setPassword2("");
      await showAlert("프로필이 수정되었습니다.", "success");
    } catch (e) {
      console.error(e);
      await showAlert("프로필 수정에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
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
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={14} />
                  <span>{email || "-"}</span>
                </div>
              </div>
            </div>

            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                <Edit3 size={18} />
                프로필 수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setEditing(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
                >
                  <X size={18} />
                  취소
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <FieldCard title="기본 정보" desc="계정의 기본 정보입니다." icon={User}>
        {!editing ? (
          <>
            <InfoRow label="이름" value={loginInfo?.name} icon={User} />
            <InfoRow label="이메일" value={email} icon={Mail} />
            <InfoRow label="권한" value={role} icon={Shield} />
          </>
        ) : (
          <>
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
          </>
        )}
      </FieldCard>

      {/* 수정 모드에서만 노출 */}
      {editing ? (
        <FieldCard
          title="비밀번호 변경"
          desc="비밀번호를 변경하려면 아래 필드를 입력하세요. (선택사항)"
          icon={Lock}
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
            <div>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={saving}
                placeholder="새 비밀번호"
              />
              <p className="mt-2 text-xs text-slate-400">
                4자 이상 입력해주세요.
              </p>
            </div>

            <div>
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={saving}
                placeholder="새 비밀번호 확인"
              />
              <p className="mt-2 text-xs text-slate-400">
                위 비밀번호와 동일하게 입력해주세요.
              </p>
            </div>
          </div>
        </FieldCard>
      ) : null}
    </section>
  );
};

export default ProfileComponent;
