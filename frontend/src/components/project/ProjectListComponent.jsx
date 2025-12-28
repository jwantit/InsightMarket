import ProjectRowComponent from "./ProjectRowComponent";

const ProjectListComponent = ({ projects, onCreate, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
            프로젝트 / 캠페인
          </h1>
          <p className="text-sm text-gray-500">
            브랜드별 마케팅 프로젝트를 생성하고 기간/키워드를 관리합니다.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800"
        >
          <span className="text-base">＋</span>
          프로젝트 생성
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-bold">프로젝트명</th>
                <th className="px-4 py-3 text-left font-bold">기간</th>
                <th className="px-4 py-3 text-left font-bold">상태</th>
                <th className="px-4 py-3 text-right font-bold"></th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {projects?.length ? (
                projects.map((p) => (
                  <ProjectRowComponent
                    key={p.projectId}
                    project={p}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    아직 등록된 프로젝트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectListComponent;
