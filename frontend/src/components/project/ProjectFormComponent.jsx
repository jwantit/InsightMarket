const ProjectFormComponent = ({ form, setForm }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 프로젝트명 */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            프로젝트명
          </label>
          <input
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="예) 2025 여름 프로모션"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
  
        {/* 시작일 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            시작일
          </label>
          <input
            type="date"
            value={form.startDate ?? ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
  
        {/* 종료일 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            종료일
          </label>
          <input
            type="date"
            value={form.endDate ?? ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>
    );
  };
  
  export default ProjectFormComponent;
  