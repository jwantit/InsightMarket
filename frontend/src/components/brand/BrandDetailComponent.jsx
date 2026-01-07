// src/components/brand/BrandDetailComponent.jsx
import React from "react";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Info,
} from "lucide-react";

export default function BrandDetailComponent({
  loading,
  brand,
  onBack,
  onEdit,
  onDelete,
}) {
  if (loading)
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-slate-100 animate-pulse">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl" />
        <div className="h-4 w-48 bg-slate-50 rounded-full" />
      </div>
    );

  const competitors = brand?.competitors || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 상단 프로필 요약 카드 */}
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-200">
            {brand.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {brand.name}
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={12} /> {brand.role}
              </span>
            </div>
            <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
              {brand.description || "설명이 등록되지 않은 브랜드입니다."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onBack}
            className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 hover:border-slate-300"
          >
            <ArrowLeft size={22} />
          </button>
          {brand.role === "BRAND_ADMIN" && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                <Edit3 size={18} /> 정보 수정
              </button>
              <button
                onClick={onDelete}
                className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all border border-red-50 hover:border-red-100"
              >
                <Trash2 size={22} />
              </button>
            </>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
      </div>

      {/* 대시보드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽: 미니 스탯 카드 */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={14} className="text-blue-400" /> 분석 라이브
            </h3>
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                  분석 중인 경쟁사
                </p>
                <p className="text-4xl font-black mt-1">
                  {competitors.length}
                  <span className="text-lg text-slate-600 ml-1 font-medium">
                    Brands
                  </span>
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-500 font-black uppercase">
                  최종 동기화
                </p>
                <p className="text-xs font-bold mt-1 text-blue-400">Just Now</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* 오른쪽: 경쟁사 상세 목록 */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Users size={18} className="text-blue-600" /> 경쟁 브랜드
                벤치마킹 데스크
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitors.length > 0 ? (
                competitors.map((c) => (
                  <div
                    key={c.competitorId}
                    className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform font-mono">
                          {c.name.slice(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {c.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                            Competitor ID: {c.competitorId}
                          </p>
                        </div>
                      </div>
                      {c.enabled ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase border border-slate-200">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Info size={32} className="text-slate-300 mb-2" />
                  <p className="text-slate-400 font-bold">
                    경쟁사가 등록되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
