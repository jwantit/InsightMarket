const SolutionToolbar = ({
  projectList,
  projectId,
  onProjectChange,
  filter,
  onFilterChange,
  showFilter = true,
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-4">
      {/* 프로젝트 선택 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">
          프로젝트
        </span>

        <select
          value={projectId ?? ""}
          onChange={(e) => {
            const newProjectId = e.target.value ? Number(e.target.value) : null;
            onProjectChange(newProjectId);
          }}
          className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="" disabled>
            프로젝트 선택
          </option>

          {projectList.map((project) => (
            <option key={project.projectId} value={project.projectId}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* 필터 버튼 - showFilter가 true일 때만 표시 */}
      {showFilter && filter !== undefined && onFilterChange !== undefined && ( // Added checks for filter and onFilterChange
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange("ALL")}
            className={`px-4 py-2 text-sm rounded-md font-medium ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            NEW전략
          </button>

          <button
            onClick={() => onFilterChange("RECENT")}
            className={`px-4 py-2 text-sm rounded-md font-medium ${
              filter === "RECENT"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            전체보기
          </button>
        </div>
      )}
    </div>
  );
};

export default SolutionToolbar;