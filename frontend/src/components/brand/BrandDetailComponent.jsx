import React from "react";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  Globe,
  ShieldCheck,
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
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
      </div>
    );

  const isAdmin = brand?.role === "BRAND_ADMIN";
  const competitors = brand?.competitors || [];

  return (
    <div className="space-y-6">
      {/* 고정형 헤더 바 */}
      <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200">
            {brand.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {brand.name}
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase">
                <ShieldCheck size={10} /> {brand.role}
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
              {brand.description || "설명이 등록되지 않은 브랜드입니다."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100"
              >
                <Edit3 size={16} /> 정보 수정
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

      {/* 대시보드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 섹션: 핵심 지표 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              분석 현황 요약
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  경쟁사
                </p>
                <p className="text-2xl font-black mt-1">{competitors.length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  활성 상태
                </p>
                <p className="text-2xl font-black mt-1 text-emerald-400">
                  {competitors.filter((c) => c.enabled).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 섹션: 경쟁사 상세 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-full">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users size={14} /> 경쟁 브랜드 분석 데스크
            </h3>
            <div className="grid gap-4">
              {competitors.length > 0 ? (
                competitors.map((c) => (
                  <div
                    key={c.competitorId}
                    className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 shadow-sm">
                          {c.name.slice(0, 1)}
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {c.name}
                        </h4>
                      </div>
                      {c.enabled ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle2 size={12} /> 분석 중
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          제외됨
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-medium">
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
