// import React, { useMemo, useCallback } from "react";
// import {
//   Save,
//   X,
//   Plus,
//   CheckCircle2,
//   AlertCircle,
//   Building2,
//   Users,
// } from "lucide-react";
// import CompetitorCard from "./CompetitorCard";

// const cn = (...xs) => xs.filter(Boolean).join(" ");
// const trim = (v) => (v ?? "").trim();

// // 업그레이드된 StatPill: 그라데이션 보더와 아이콘 추가
// function StatPill({ label, value, icon: Icon, colorClass }) {
//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
//       <div className={cn("absolute top-0 left-0 h-1 w-full", colorClass)} />
//       <div className="flex items-center gap-3">
//         <div
//           className={cn(
//             "p-2 rounded-xl bg-slate-50",
//             colorClass.replace("bg-", "text-")
//           )}
//         >
//           <Icon size={18} />
//         </div>
//         <div>
//           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//             {label}
//           </p>
//           <p className="text-xl font-black text-slate-900">{value}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Section({ title, desc, icon: Icon, right, children }) {
//   return (
//     <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
//       <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           {Icon && (
//             <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
//               <Icon size={20} />
//             </div>
//           )}
//           <div>
//             <h3 className="text-base font-bold text-slate-900">{title}</h3>
//             {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
//           </div>
//         </div>
//         {right}
//       </div>
//       <div className="p-6">{children}</div>
//     </div>
//   );
// }

// export default function BrandFormComponent({
//   mode,
//   loading,
//   saving,
//   canSubmit,
//   form,
//   setForm,
//   onCancel,
//   onSubmit,
// }) {
//   const competitorCount = (form.competitors || []).length;
//   const enabledCount = (form.competitors || []).filter((c) => c.enabled).length;

//   const allEnabled =
//     competitorCount > 0 && (form.competitors || []).every((c) => c.enabled);

//   const updateBasic = (key, value) =>
//     setForm((prev) => ({ ...prev, [key]: value }));

//   return (
//     <div className="space-y-6 pb-20">
//       {/* 상단 액션 바: 스티키 적용으로 사용성 개선 */}
//       <div className="sticky top-16 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg mb-8">
//         <div className="flex items-center gap-3 px-2">
//           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
//             <Building2 size={20} />
//           </div>
//           <h2 className="text-lg font-black text-slate-900">
//             {mode === "EDIT" ? "브랜드 정보 수정" : "새 브랜드 프로필 생성"}
//           </h2>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
//           >
//             취소
//           </button>
//           <button
//             onClick={onSubmit}
//             disabled={!canSubmit || saving}
//             className={cn(
//               "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95",
//               !canSubmit || saving
//                 ? "bg-slate-100 text-slate-400 cursor-not-allowed"
//                 : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
//             )}
//           >
//             {saving ? (
//               <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
//             ) : (
//               <Save size={18} />
//             )}
//             {mode === "EDIT" ? "변경사항 저장" : "브랜드 등록"}
//           </button>
//         </div>
//       </div>

//       {/* 대시보드형 스탯바 */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <StatPill
//           label="분석 경쟁사"
//           value={`${competitorCount}개`}
//           icon={Users}
//           colorClass="bg-indigo-500"
//         />
//         <StatPill
//           label="현재 활성화"
//           value={`${enabledCount}개`}
//           icon={CheckCircle2}
//           colorClass="bg-emerald-500"
//         />
//       </div>

//       {/* 기본 정보 섹션 */}
//       <Section
//         title="기본 정보"
//         desc="플랫폼 내에서 식별될 브랜드의 기본 정체성을 설정합니다."
//         icon={Building2}
//       >
//         <div className="grid gap-6">
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <label className="text-sm font-bold text-slate-700">
//                 브랜드 공식 명칭
//               </label>
//               <span className="text-[10px] text-red-500 font-bold uppercase">
//                 Required
//               </span>
//             </div>
//             <input
//               value={form.name}
//               onChange={(e) => updateBasic("name", e.target.value)}
//               disabled={mode === "EDIT"}
//               className={cn(
//                 "w-full px-4 py-3 rounded-xl border transition-all outline-none text-sm font-medium",
//                 mode === "EDIT"
//                   ? "bg-slate-50 text-slate-500 cursor-not-allowed"
//                   : "focus:ring-4 focus:ring-blue-50 focus:border-blue-500 border-slate-200"
//               )}
//               placeholder="예: InsightMarket 공식 계정"
//             />
//           </div>
//           <div className="space-y-2">
//             <label className="text-sm font-bold text-slate-700">
//               브랜드 상세 설명
//             </label>
//             <textarea
//               value={form.description}
//               onChange={(e) => updateBasic("description", e.target.value)}
//               rows={3}
//               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
//               placeholder="브랜드의 주요 비즈니스 영역이나 목적을 입력하세요."
//             />
//           </div>
//         </div>
//       </Section>

//       {/* 경쟁사 관리 섹션 */}
//       <Section
//         title="경쟁사 벤치마킹"
//         desc="분석 데이터에 포함될 라이벌 브랜드와 핵심 키워드를 구성합니다."
//         icon={Users}
//         right={
//           <div className="flex gap-2">
//             <button
//               type="button"
//               onClick={() =>
//                 setForm((prev) => ({
//                   ...prev,
//                   competitors: (prev.competitors || []).map((c) => ({
//                     ...c,
//                     enabled: !allEnabled,
//                   })),
//                 }))
//               }
//               className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
//             >
//               {allEnabled ? "전체 비활성화" : "전체 활성화"}
//             </button>
//             <button
//               type="button"
//               onClick={() =>
//                 setForm((prev) => ({
//                   ...prev,
//                   competitors: [
//                     ...(prev.competitors || []),
//                     {
//                       competitorId: null,
//                       name: "",
//                       enabled: true,
//                     },
//                   ],
//                 }))
//               }
//               className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors flex items-center gap-1.5"
//             >
//               <Plus size={14} /> 추가
//             </button>
//           </div>
//         }
//       >
//         <div className="space-y-4">
//           {(form.competitors || []).length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
//               <Users size={40} className="text-slate-200 mb-3" />
//               <p className="text-sm font-bold text-slate-400">
//                 등록된 경쟁사가 없습니다.
//               </p>
//               <p className="text-xs text-slate-400 mt-1">
//                 상단의 추가 버튼을 눌러 분석 대상을 등록하세요.
//               </p>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {form.competitors.map((c, i) => (
//                 <CompetitorCard
//                   key={i}
//                   competitor={c}
//                   index={i}
//                   onChange={(updated) =>
//                     setForm((prev) => {
//                       const all = [...prev.competitors];
//                       all[i] = updated;
//                       return { ...prev, competitors: all };
//                     })
//                   }
//                   onRemove={() =>
//                     setForm((prev) => ({
//                       ...prev,
//                       competitors: prev.competitors.filter(
//                         (_, idx) => idx !== i
//                       ),
//                     }))
//                   }
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </Section>
//     </div>
//   );
// }

// src/components/brand/BrandFormComponent.jsx
import React from "react";
import {
  Save,
  X,
  Plus,
  CheckCircle2,
  Building2,
  Users,
  AlertCircle,
} from "lucide-react";
import CompetitorCard from "./CompetitorCard";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function Section({ title, desc, icon: Icon, right, children }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
      <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm border border-slate-100">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            {desc && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {desc}
              </p>
            )}
          </div>
        </div>
        {right}
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

export default function BrandFormComponent({
  mode,
  loading,
  saving,
  canSubmit,
  form,
  setForm,
  onCancel,
  onSubmit,
}) {
  const competitorCount = (form.competitors || []).length;
  const allEnabled =
    competitorCount > 0 && (form.competitors || []).every((c) => c.enabled);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* 액션 바 */}
      <div className="sticky top-20 z-30 flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 mb-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Building2 size={20} />
          </div>
          <h2 className="text-lg font-black text-slate-900">
            {mode === "EDIT" ? "브랜드 프로필 수정" : "새 브랜드 등록"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={!canSubmit || saving}
            className={cn(
              "flex items-center gap-2 px-7 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95",
              !canSubmit || saving
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700"
            )}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <Save size={18} />
            )}
            저장하기
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* 기본 정보 */}
        <Section
          title="브랜드 정체성"
          desc="대시보드와 리포트에서 사용될 브랜드의 기본 정보를 설정합니다."
          icon={Building2}
        >
          <div className="grid gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                공식 명칭 <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={mode === "EDIT"}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 disabled:opacity-50"
                placeholder="예: InsightMarket"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                브랜드 설명
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-slate-600 resize-none"
                placeholder="브랜드의 주요 특징을 간략히 설명해주세요."
              />
            </div>
          </div>
        </Section>

        {/* 경쟁사 관리 */}
        <Section
          title="경쟁사 벤치마킹"
          desc="비교 분석 대상이 될 라이벌 브랜드를 등록하세요."
          icon={Users}
          right={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    competitors: p.competitors.map((c) => ({
                      ...c,
                      enabled: !allEnabled,
                    })),
                  }))
                }
                className="px-4 py-2 text-[10px] font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all uppercase"
              >
                {allEnabled ? "Disable All" : "Enable All"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    competitors: [
                      ...p.competitors,
                      { competitorId: null, name: "", enabled: true },
                    ],
                  }))
                }
                className="px-4 py-2 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all uppercase flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                <Plus size={14} /> Add New
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.competitors?.length > 0 ? (
              form.competitors.map((c, i) => (
                <CompetitorCard
                  key={i}
                  competitor={c}
                  index={i}
                  onChange={(updated) =>
                    setForm((p) => {
                      const all = [...p.competitors];
                      all[i] = updated;
                      return { ...p, competitors: all };
                    })
                  }
                  onRemove={() =>
                    setForm((p) => ({
                      ...p,
                      competitors: p.competitors.filter((_, idx) => idx !== i),
                    }))
                  }
                />
              ))
            ) : (
              <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center text-center">
                <Users size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">
                  등록된 경쟁사가 없습니다.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      competitors: [
                        { competitorId: null, name: "", enabled: true },
                      ],
                    }))
                  }
                  className="mt-4 text-blue-600 font-black text-xs uppercase hover:underline"
                >
                  첫 번째 경쟁사 추가하기
                </button>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
