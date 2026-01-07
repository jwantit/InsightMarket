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
  isModal = false, // 모달 내부에서 사용될 때 true
}) {
  const competitorCount = (form.competitors || []).length;
  const allEnabled =
    competitorCount > 0 && (form.competitors || []).every((c) => c.enabled);

  return (
    <div
      className={cn(
        "space-y-8",
        isModal
          ? "pb-8"
          : "max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-500"
      )}
    >
      {/* 액션 바 - 모달 모드일 때는 숨김 */}
      {!isModal && (
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
      )}

      {/* 모달 모드일 때 하단 액션 버튼 */}
      {isModal && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 -mx-8 -mb-8 flex items-center justify-end gap-3">
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
            등록하기
          </button>
        </div>
      )}

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
                {allEnabled ? "전체 비활성화" : "전체 활성화"}
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
                <Plus size={14} /> 경쟁사 추가
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
