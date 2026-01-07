// import BrandComponent from "../../components/brand/BrandComponent";
// import { BarChart3 } from "lucide-react";

// const BrandPage = () => {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
//             <BarChart3 size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 tracking-tight">
//               브랜드 관리
//             </h1>
//           </div>
//         </div>
//       </div>
//       <BrandComponent />
//     </div>
//   );
// };

// export default BrandPage;

// src/pages/brand/BrandPage.jsx
import React, { useRef, useState } from "react";
import { Building2, Plus, Users, LayoutGrid } from "lucide-react";
import BrandComponent from "../../components/brand/BrandComponent";
import PageHeader from "../../components/common/PageHeader";

const BrandPage = () => {
  const brandRef = useRef();
  const [totalCount, setTotalCount] = useState(0);

  // 헤더 우측 "브랜드 등록" 버튼 클릭 시 자식의 openCreate 실행
  const handleOpenCreate = () => {
    if (brandRef.current) {
      brandRef.current.openCreate();
    }
  };

  const headerExtra = (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
            Total Brands
          </p>
          <p className="text-sm font-black text-slate-900">
            {totalCount}개 활성
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <LayoutGrid size={16} />
        </div>
      </div>

      <button
        onClick={handleOpenCreate}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
      >
        <Plus size={18} />
        브랜드 등록
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <PageHeader
        icon={Building2}
        title="브랜드 관리"
        breadcrumb="Management / Brands"
        subtitle="현재 관리 중인 모든 브랜드 리스트입니다. 브랜드별 대시보드 권한 및 데이터를 제어할 수 있습니다."
        extra={headerExtra}
        badge="Pro"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              전체 브랜드 수
            </p>
            <p className="text-lg font-black text-slate-900">{totalCount}개</p>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
        {/* ref를 전달하고, 개수 변경 시 상태 업데이트 */}
        <BrandComponent
          ref={brandRef}
          onCountChange={(count) => setTotalCount(count)}
        />
      </div>
    </div>
  );
};

export default BrandPage;
