// src/components/brand/BrandListComponent.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Plus, Search, Users, ChevronRight, LayoutGrid } from "lucide-react";
import { getThumbnailUrl } from "../../util/fileUtil";

const BrandListComponent = ({
  brands,
  query,
  setQuery,
  onCreate,
  onSelect,
  loading,
}) => {
  const loginState = useSelector((state) => state.loginSlice);
  const systemRole = loginState?.role;
  const isCompanyAdmin = systemRole === "COMPANY_ADMIN";
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 검색 및 액션 바 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="브랜드 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-sm"
          />
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.brandId}
            onClick={() => onSelect(brand.brandId)}
            className="group relative bg-white border border-slate-200 rounded-[2rem] p-5 cursor-pointer hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300"
          >
            {/* 상단 로고 & 배지 */}
            <div className="flex justify-between items-start mb-4">
              {brand.imageFileId ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 group-hover:border-blue-300 transition-all duration-300 shadow-sm">
                  <img
                    src={getThumbnailUrl(brand.imageFileId)}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner font-mono">
                  {brand.name.slice(0, 1)}
                </div>
              )}
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-lg uppercase tracking-tight">
                  {brand.role === "BRAND_ADMIN" ? "Admin" : "Member"}
                </span>
              </div>
            </div>

            {/* 정보 영역 */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                {brand.name}
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:translate-x-1 transition-transform"
                />
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8 font-medium">
                {brand.description || "등록된 설명이 없습니다."}
              </p>
            </div>

            {/* 통계 정보 칩 */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                <Users size={12} />
                <span className="text-[10px] font-black uppercase">
                  경쟁사 {brand.competitors?.length || 0}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <LayoutGrid size={14} />
              </div>
            </div>
          </div>
        ))}

        {/* 빈 카드 추가 버튼 - Company_admin만 표시 */}
        {isCompanyAdmin && (
          <button
            onClick={onCreate}
            className="group min-h-[200px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
              <Plus size={24} />
            </div>
            <div className="text-center">
              <span className="block text-sm font-black text-slate-500 group-hover:text-blue-600">
                새 브랜드 등록
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                데이터 분석을 시작하세요
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default BrandListComponent;
