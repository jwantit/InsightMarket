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
  Building2,
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
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      </div>
    );

  const competitors = brand?.competitors || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 상단 프로필 헤더 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                {brand.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {brand.name}
                  </h1>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                    <ShieldCheck size={12} /> {brand.role}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {brand.description || "설명이 등록되지 않은 브랜드입니다."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onBack}
                className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 hover:border-slate-300"
              >
                <ArrowLeft size={20} />
              </button>
              {brand.role === "BRAND_ADMIN" && (
                <>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100"
                  >
                    <Edit3 size={16} />
                    수정
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 및 경쟁사 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 통계 카드 */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                <Activity size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                분석 현황
              </h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                분석 중인 경쟁사
              </p>
              <p className="text-3xl font-black text-slate-900">
                {competitors.length}
                <span className="text-base text-slate-500 ml-1 font-medium">
                  개
                </span>
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                활성 경쟁사
              </p>
              <p className="text-xl font-black text-blue-600">
                {competitors.filter((c) => c.enabled).length}
                <span className="text-sm text-slate-500 ml-1 font-medium">
                  개
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 경쟁사 목록 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                경쟁 브랜드
              </h3>
            </div>
          </div>
          <div className="p-6">
            {competitors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map((c) => (
                  <div
                    key={c.competitorId}
                    className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform shrink-0">
                          {c.name.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {c.name}
                          </h4>
                        </div>
                      </div>
                      {c.enabled ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-200 shrink-0">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase border border-slate-200 shrink-0">
                          Paused
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Info size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold text-sm">
                  경쟁사가 등록되지 않았습니다.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  브랜드 수정에서 경쟁사를 추가할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
