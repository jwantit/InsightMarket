import { useSelector } from "react-redux";
import ProfileComponent from "../../components/profile/ProfileComponent";
import PendingMembersComponent from "../../components/profile/PendingMembersComponent";

const ProfilePage = () => {
  const loginInfo = useSelector((state) => state.loginSlice);
  const roleName = loginInfo?.role || "";

  const isCompanyAdmin = roleName.includes("COMPANY_ADMIN");

  return (
    <div className="space-y-10">
      {/* 기본 프로필 */}
      <ProfileComponent />

      {/* 관리자 전용 영역 */}
      {isCompanyAdmin && (
        <div className="pt-8 border-t">
          <PendingMembersComponent />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
