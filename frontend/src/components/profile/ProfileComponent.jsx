import { useSelector } from "react-redux";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center rounded-xl border p-4">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const ProfileComponent = () => {
  const loginInfo = useSelector((state) => state.loginSlice);

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">내 프로필</h2>

      <div className="space-y-3">
        <InfoRow label="이름" value={loginInfo.name} />
        <InfoRow label="이메일" value={loginInfo.email} />
        <InfoRow label="권한" value={loginInfo.role} />
      </div>
    </section>
  );
};

export default ProfileComponent;
