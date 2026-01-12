// src/components/brand/BrandFormComponent.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Save,
  X,
  Plus,
  CheckCircle2,
  Building2,
  Users,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import CompetitorCard from "./CompetitorCard";
import { getThumbnailUrl } from "../../util/fileUtil";

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
  imageFile,
  setImageFile,
  removeImage,
  setRemoveImage,
  onCancel,
  onSubmit,
}) {
  const competitorCount = (form.competitors || []).length;
  const allEnabled =
    competitorCount > 0 && (form.competitors || []).every((c) => c.enabled);
  
  // 이미지 미리보기 상태
  const [imagePreview, setImagePreview] = useState(
    form.imageFileId ? getThumbnailUrl(form.imageFileId) : null
  );
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // form.imageFileId가 변경되면 미리보기 업데이트
  useEffect(() => {
    if (form.imageFileId && !imageFile && !removeImage) {
      setImagePreview(getThumbnailUrl(form.imageFileId));
    } else if (removeImage) {
      setImagePreview(null);
    }
  }, [form.imageFileId, imageFile, removeImage]);

  // 이미지 파일 선택 핸들러
  const handleImageChange = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }
    
    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // 새 이미지를 선택하면 삭제 플래그 해제
    if (removeImage) {
      setRemoveImage(false);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (mode === "EDIT" && form.imageFileId) {
      // 수정 모드에서 기존 이미지가 있으면 삭제 플래그 설정
      setRemoveImage(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* 액션 바 */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 mb-10">
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
            {/* 브랜드 이미지 업로드 */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                브랜드 이미지
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative shrink-0">
                    <img
                      src={imagePreview}
                      alt="브랜드 이미지 미리보기"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : null}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                  className={`flex-1 border-2 border-dashed rounded-2xl px-5 py-4 transition-all cursor-pointer flex items-center gap-3 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <ImageIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {imagePreview ? "이미지 변경하기" : "이미지를 클릭하거나 드래그하여 업로드"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        JPG, PNG, GIF (최대 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
