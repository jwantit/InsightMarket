// import { Plus, Search, Users, ExternalLink } from "lucide-react";

// const BrandListComponent = ({
//   brands,
//   query,
//   setQuery,
//   onCreate,
//   onSelect,
// }) => {
//   return (
//     <div className="space-y-8">
//       {/* 검색 바와 브랜드 추가 버튼을 동일 선상에 배치 */}
//       <div className="flex items-center gap-4">
//         <div className="relative group flex-1">
//           <Search
//             className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
//             size={20}
//           />
//           <input
//             type="text"
//             placeholder="브랜드 명으로 검색..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
//           />
//         </div>
//         <button
//           onClick={onCreate}
//           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 shrink-0"
//         >
//           <Plus size={18} />
//           브랜드 추가
//         </button>
//       </div>

//       {/* 브랜드 카드 그리드 */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {brands.map((brand) => (
//           <div
//             key={brand.brandId}
//             onClick={() => onSelect(brand.brandId)} // 카드 전체 클릭 시 상세 페이지로
//             className="group relative bg-white border border-slate-200 rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all"
//           >
//             {/* 상단: 로고 */}
//             <div className="mb-5">
//               <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                 {brand.name.slice(0, 1)}
//               </div>
//             </div>

//             {/* 본문: 이름과 설명 */}
//             <div className="space-y-2">
//               <div className="flex items-center gap-2">
//                 <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
//                   {brand.name}
//                 </h3>
//                 <ExternalLink
//                   size={14}
//                   className="text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
//                 />
//               </div>
//               <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10">
//                 {brand.description || "등록된 설명이 없습니다."}
//               </p>
//             </div>

//             {/* 하단: 통계 지표만 깔끔하게 배치 */}
//             <div className="mt-6 pt-5 border-t border-slate-50 flex gap-4">
//               <div className="flex items-center gap-1.5">
//                 <Users size={14} className="text-indigo-500" />
//                 <span className="text-xs font-bold text-slate-600">
//                   경쟁사 {brand.competitors?.length || 0}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* 빈 카드: 추가 버튼 역할 */}
//         <button
//           onClick={onCreate}
//           className="group h-full min-h-[200px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-200 hover:bg-blue-50 transition-all"
//         >
//           <div className="p-3 rounded-full bg-slate-50 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
//             <Plus size={24} />
//           </div>
//           <span className="text-sm font-bold">새 브랜드 등록</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BrandListComponent;

// src/components/brand/BrandListComponent.jsx
import React from "react";
import { Plus, Search, Users, ChevronRight, LayoutGrid } from "lucide-react";

const BrandListComponent = ({
  brands,
  query,
  setQuery,
  onCreate,
  onSelect,
  loading,
}) => {
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
            className="group relative bg-white border border-slate-200 rounded-[2rem] p-7 cursor-pointer hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300"
          >
            {/* 상단 로고 & 배지 */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner font-mono">
                {brand.name.slice(0, 1)}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-tight">
                  {brand.role === "BRAND_ADMIN" ? "Admin" : "Member"}
                </span>
              </div>
            </div>

            {/* 정보 영역 */}
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                {brand.name}
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:translate-x-1 transition-transform"
                />
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed h-10 font-medium">
                {brand.description || "등록된 설명이 없습니다."}
              </p>
            </div>

            {/* 통계 정보 칩 */}
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                <Users size={14} />
                <span className="text-[11px] font-black uppercase">
                  경쟁사 {brand.competitors?.length || 0}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <LayoutGrid size={16} />
              </div>
            </div>
          </div>
        ))}

        {/* 빈 카드 추가 버튼 */}
        <button
          onClick={onCreate}
          className="group min-h-[260px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
            <Plus size={28} />
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
      </div>
    </div>
  );
};

export default BrandListComponent;
