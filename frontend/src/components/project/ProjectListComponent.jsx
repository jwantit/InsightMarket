import { Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import ProjectRowComponent from "./ProjectRowComponent";

const ProjectListComponent = ({ projects, onCreate, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
      {/* 프로젝트 생성 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
        >
          <Plus size={18} />
          프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 카드 그리드 */}
      {projects?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectRowComponent
              key={p.projectId}
              project={p}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 mb-1">
                등록된 프로젝트가 없습니다.
              </p>
              <p className="text-xs text-slate-400">
                프로젝트 생성 버튼을 눌러 새 프로젝트를 시작하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListComponent;
