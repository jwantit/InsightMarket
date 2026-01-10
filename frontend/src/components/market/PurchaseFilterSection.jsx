import { Calendar, RotateCcw, ArrowUpDown } from "lucide-react";

const PurchaseFilterSection = ({
  fromDate, toDate, sort,
  updateFilter, setParams
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <Calendar size={18} />
          </div>
          <span className="text-sm font-bold text-slate-700">조회 기간</span>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => updateFilter(e.target.value, toDate, sort)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium"
          />

          <span className="text-slate-400 font-bold">~</span>

          <input
            type="date"
            value={toDate}
            onChange={(e) => updateFilter(fromDate, e.target.value, sort)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>

        <button
          onClick={() => setParams({})}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md active:scale-95"
        >
          <RotateCcw size={16} />
          필터 초기화
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
            <ArrowUpDown size={18} />
          </div>
          <select
            value={sort}
            onChange={(e) => updateFilter(fromDate, toDate, e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all bg-white font-medium"
          >
            <option value="latest">최신순</option>
            <option value="pricehigh">금액 높은순</option>
            <option value="pricelow">금액 낮은순</option>
          </select>
        </div>
      </div>
    </div>
  );
};
export default PurchaseFilterSection;