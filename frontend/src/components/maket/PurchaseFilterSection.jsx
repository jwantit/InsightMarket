const PurchaseFilterSection = ({
  fromDate, toDate, sort,
  updateFilter, setParams
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">조회 기간</span>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => updateFilter(e.target.value, toDate, sort)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none"
        />

        <span className="text-gray-400">~</span>

        <input
          type="date"
          value={toDate}
          onChange={(e) => updateFilter(fromDate, e.target.value, sort)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none"
        />
      </div>

      <button onClick={() => setParams({})} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-black transition-all">
        필터 초기화
      </button>

      <select
        value={sort}
        onChange={(e) => updateFilter(fromDate, toDate, e.target.value)}
        className="ml-auto border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 bg-white"
      >
        <option value="latest">최신순</option>
        <option value="pricehigh">금액 높은순</option>
        <option value="pricelow">금액 낮은순</option>
      </select>
      
    </div>
  );
};
export default PurchaseFilterSection;