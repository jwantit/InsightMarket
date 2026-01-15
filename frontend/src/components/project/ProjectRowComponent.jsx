import { Calendar, Edit2, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";

const ProjectRowComponent = ({ project, onEdit, onDelete }) => {
  const today = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);

  let status;
  let statusClass;
  let statusIcon;

  if (today < start) {
    status = "진행전";
    statusClass = "bg-amber-50 text-amber-700 border-amber-200";
    statusIcon = <Clock size={12} />;
  } else if (today <= end) {
    status = "진행중";
    statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    statusIcon = <CheckCircle2 size={12} />;
  } else {
    status = "종료";
    statusClass = "bg-slate-100 text-slate-600 border-slate-200";
    statusIcon = <XCircle size={12} />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all">
      {/* 상단: 프로젝트명과 상태 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
            {project.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}
          >
            {statusIcon}
            {status}
          </span>
        </div>
      </div>

      {/* 기간 정보 */}
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
        <Calendar size={16} className="text-slate-400" />
        <span className="font-medium">
          {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
        </span>
      </div>

      {/* 키워드 개수 (있는 경우) */}
      {project.keywords && project.keywords.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-1.5">
            {project.keywords.slice(0, 3).map((k, idx) => (
              <span
                key={idx}
                className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
              >
                #{k.keyword || k.text}
              </span>
            ))}
            {project.keywords.length > 3 && (
              <span className="text-xs font-bold text-slate-400">
                +{project.keywords.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 하단: 액션 버튼 */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
        <button
          onClick={() => onEdit(project.projectId)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Edit2 size={14} />
          수정
        </button>
        <button
          onClick={() => onDelete(project.projectId)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          삭제
        </button>
      </div>
    </div>
  );
};

export default ProjectRowComponent;
