import ModifyComponent from "../../components/member/ModifyComponent";
import MainLayout from "../../layouts/MainLayout";

const ModfyPage = () => {
  return (
    <>
      <div className=" text-3xl">Member Modify Page</div>

      <div className="bg-white w-full mt-4 p-2">
        <ModifyComponent></ModifyComponent>
      </div>
    </>
  );
};

export default ModfyPage;
