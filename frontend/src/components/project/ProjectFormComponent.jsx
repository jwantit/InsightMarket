const ProjectFormComponent = ({ form, setForm }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* 프로젝트명 */}
      <div className="sm:col-span-2 space-y-2">
        <label className="text-sm font-bold text-slate-700">
          프로젝트명 <span className="text-red-500">*</span>
        </label>
        <input
          value={form.name ?? ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="예: 2025 여름 프로모션"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* 시작일 */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          시작일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.startDate ?? ""}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* 종료일 */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          종료일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.endDate ?? ""}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
        />
      </div>
    </div>
  );
};

export default ProjectFormComponent;
  