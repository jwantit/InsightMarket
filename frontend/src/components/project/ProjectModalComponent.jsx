import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, FolderKanban, Tag } from "lucide-react";
import ProjectFormComponent from "./ProjectFormComponent";
import ProjectKeywordBoxComponent from "./ProjectKeywordBoxComponent";

const ProjectModalComponent = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState(project);

  // project가 바뀌면(수정/생성 전환) form도 동기화
  useEffect(() => {
    setForm(project);
  }, [project]);

  const isEdit = !!form?.projectId;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    // payload 정리
    const payload = {
      projectId: form.projectId,
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      keywords: (form.keywords || []).map((k) => ({
        projectKeywordId: k.projectKeywordId ?? null,
        text: k.keyword, // 키워드 텍스트
        enabled: k.enabled ?? true,
      })),
    };

    onSave(payload);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isEdit ? "프로젝트 수정" : "새 프로젝트 생성"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                프로젝트 기간과 키워드를 설정하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="닫기"
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Section: 기본 정보 */}
          <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                <FolderKanban size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">기본 정보</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  프로젝트명과 기간을 입력하세요.
                </p>
              </div>
            </div>
            <div className="p-6">
              <ProjectFormComponent form={form} setForm={setForm} />
            </div>
          </div>

          {/* Section: 키워드 */}
          <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    프로젝트 키워드
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    체크로 활성화/비활성화
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ProjectKeywordBoxComponent form={form} setForm={setForm} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
          >
            <Save size={18} />
            {isEdit ? "변경사항 저장" : "프로젝트 생성"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModalComponent;
