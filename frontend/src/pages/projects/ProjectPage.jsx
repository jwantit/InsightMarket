import ProjectComponent from "../../components/project/ProjectComponent";
import { FolderKanban } from "lucide-react";

const ProjectPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FolderKanban size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              프로젝트 관리
            </h1>
          </div>
        </div>
      </div>
      <ProjectComponent />
    </div>
  );
};

export default ProjectPage;
