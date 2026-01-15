import { User } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ProfileComponent from "../../components/profile/ProfileComponent";

const ProfilePage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={User}
        title="내 프로필"
        breadcrumb="Account / Profile"
        subtitle="계정 정보를 확인하고 수정할 수 있습니다."
      />
      <ProfileComponent />
    </div>
  );
};

export default ProfilePage;
