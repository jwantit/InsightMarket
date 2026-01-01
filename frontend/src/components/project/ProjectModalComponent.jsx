import { useEffect, useState } from "react";
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-gray-900 truncate">
              {isEdit ? "프로젝트 수정" : "프로젝트 생성"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              프로젝트 기간과 키워드를 설정하세요.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="닫기"
            title="닫기"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Section: 기본 정보 */}
          <div className="rounded-xl border bg-white">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-bold text-gray-800">
                기본 정보
              </div>
            </div>
            <div className="p-4">
              <ProjectFormComponent form={form} setForm={setForm} />
            </div>
          </div>

          {/* Section: 키워드 */}
          <div className="rounded-xl border bg-white">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm font-bold text-gray-800">
                프로젝트 키워드
              </div>
              <div className="text-xs text-gray-500">
                체크로 활성화/비활성화
              </div>
            </div>
            <div className="p-4">
              <ProjectKeywordBoxComponent form={form} setForm={setForm} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
          >
            {isEdit ? "저장" : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModalComponent;
