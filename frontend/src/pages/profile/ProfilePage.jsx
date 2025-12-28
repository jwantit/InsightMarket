import ProfileComponent from "../../components/profile/ProfileComponent";

const ProfilePage = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="bg-white border rounded-2xl shadow-sm">
          <div className="p-5 sm:p-7">
            <ProfileComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
