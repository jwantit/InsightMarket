import { Plus, Search, Users, ExternalLink } from "lucide-react";

const BrandListComponent = ({
  brands,
  query,
  setQuery,
  onCreate,
  onSelect,
}) => {
  return (
    <div className="space-y-8">
      {/* 검색 바와 브랜드 추가 버튼을 동일 선상에 배치 */}
      <div className="flex items-center gap-4">
        <div className="relative group flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="브랜드 명으로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus size={18} />
          브랜드 추가
        </button>
      </div>

      {/* 브랜드 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.brandId}
            onClick={() => onSelect(brand.brandId)} // 카드 전체 클릭 시 상세 페이지로
            className="group relative bg-white border border-slate-200 rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all"
          >
            {/* 상단: 로고 */}
            <div className="mb-5">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {brand.name.slice(0, 1)}
              </div>
            </div>

            {/* 본문: 이름과 설명 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>
                <ExternalLink
                  size={14}
                  className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
                />
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
                {brand.description || "등록된 설명이 없습니다."}
              </p>
            </div>

            {/* 하단: 통계 지표만 깔끔하게 배치 */}
            <div className="mt-6 pt-5 border-t border-slate-50 flex gap-4">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-indigo-500" />
                <span className="text-xs font-bold text-slate-600">
                  경쟁사 {brand.competitors?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* 빈 카드: 추가 버튼 역할 */}
        <button
          onClick={onCreate}
          className="group h-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-200 hover:bg-blue-50 transition-all"
        >
          <div className="p-3 rounded-full bg-slate-50 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold">새 브랜드 등록</span>
        </button>
      </div>
    </div>
  );
};

export default BrandListComponent;
