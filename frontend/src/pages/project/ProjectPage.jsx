import ProjectComponent from "../../components/project/ProjectComponent";
import { Rocket } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const ProjectPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={Rocket}
        title="프로젝트 관리"
        breadcrumb="Management / Projects"
        subtitle="브랜드별 프로젝트를 생성하고 관리할 수 있습니다. 프로젝트별로 키워드와 데이터 수집을 제어합니다."
      />
      <ProjectComponent />
    </div>
  );
};

export default ProjectPage;
