// src/components/profile/ProfileComponent.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { modifyMember } from "../../api/memberApi";
import { updateProfile } from "../../store/slices/loginSlice";

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
    {children}
  </span>
);

const Label = ({ children }) => (
  <p className="text-xs font-semibold text-gray-500">{children}</p>
);

const Input = (props) => (
  <input
    {...props}
    className={[
      "w-full rounded-xl border bg-white px-3 py-2 text-sm",
      "outline-none transition",
      "focus:border-gray-400 focus:ring-4 focus:ring-gray-100",
      "disabled:bg-gray-50 disabled:text-gray-400",
      props.className || "",
    ].join(" ")}
  />
);

const FieldCard = ({ title, children, desc }) => (
  <div className="rounded-2xl border bg-white p-5 sm:p-6">
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-gray-500">{desc}</p> : null}
    </div>
    <div className="mt-5 space-y-4">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-xl border p-4 flex items-center justify-between">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-sm font-semibold text-gray-900">{value ?? "-"}</div>
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

  const validate = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return false;
    }
    if (password || password2) {
      if (password.length < 4) {
        alert("비밀번호는 4자 이상으로 입력해주세요.");
        return false;
      }
      if (password !== password2) {
        alert("비밀번호가 일치하지 않습니다.");
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

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
      alert("프로필이 수정되었습니다.");
    } catch (e) {
      console.error(e);
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">내 프로필</h1>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 active:scale-[0.99]"
          >
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
              className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Summary Card */}
      <div className="rounded-2xl border bg-gradient-to-b from-gray-50 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-900 text-white grid place-items-center font-bold">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-gray-900">
                  {loginInfo?.name || "이름 없음"}
                </p>
                <Pill>{role || "ROLE"}</Pill>
              </div>
              <p className="mt-1 text-sm text-gray-600">{email || "-"}</p>
            </div>
          </div>          
        </div>
      </div>

      {/* Basic Info */}
      <FieldCard
        title="기본 정보"
      >
        {!editing ? (
          <>
            <InfoRow label="이름" value={loginInfo?.name} />
            <InfoRow label="이메일" value={email} />
            <InfoRow label="권한" value={role} />
          </>
        ) : (
          <>
            <div>
              <Label>이름</Label>
              <div className="mt-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  placeholder="이름을 입력하세요"
                />
                <p className="mt-1 text-xs text-gray-400">
                  화면에 표시되는 이름입니다.
                </p>
              </div>
            </div>

            <div>
              <Label>이메일</Label>
              <div className="mt-2">
                <Input value={email} disabled />
              </div>
            </div>

            <div>
              <Label>권한</Label>
              <div className="mt-2">
                <Input value={role} disabled />
              </div>
            </div>
          </>
        )}
      </FieldCard>

      {/* 수정 모드에서만 노출 */}
      {editing ? (
        <FieldCard
          title="비밀번호 변경 (선택)"
        >
          <div className="rounded-2xl border bg-gray-50 p-4 space-y-4">
            <div>
              <Label>새 비밀번호</Label>
              <div className="mt-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={saving}
                  placeholder="새 비밀번호"
                />
                <p className="mt-1 text-xs text-gray-400">4자 이상 입력</p>
              </div>
            </div>

            <div>
              <Label>새 비밀번호 확인</Label>
              <div className="mt-2">
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  disabled={saving}
                  placeholder="새 비밀번호 확인"
                />
              </div>
            </div>
          </div>
        </FieldCard>
      ) : null}
    </section>
  );
};

export default ProfileComponent;
