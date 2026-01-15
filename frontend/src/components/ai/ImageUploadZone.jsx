// src/components/ai/ImageUploadZone.jsx
import React from "react";
import { Upload, Image as ImageIcon, X, MousePointerClick } from "lucide-react";

const ImageUploadZone = ({
  fileInputRef,
  dropZoneRef,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onOpenFileDialog,
  selectedFile,
  onRemoveFile,
}) => {
  return (
    <div
      ref={dropZoneRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative group border-4 border-dashed rounded-[3rem] p-12 text-center transition-all duration-500 overflow-hidden
        ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/5"
        }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
        className="hidden"
      />

      {selectedFile ? (
        <div className="relative z-10 space-y-6">
          <div className="relative inline-block group/preview">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              className="max-h-80 rounded-3xl shadow-2xl border-4 border-white transition-transform group-hover/preview:scale-[1.02]"
            />
            <button
              type="button"
              onClick={onRemoveFile}
              className="absolute -top-4 -right-4 p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-black text-slate-900">
              {selectedFile.name}
            </p>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY TO
              ANALYZE
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 space-y-6 py-10"
          onClick={onOpenFileDialog}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <ImageIcon size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">
              Drop your Ad visual here
            </h3>
            <p className="text-sm font-medium text-slate-400">
              이미지를 드래그하거나 클릭하여 업로드 하세요 (Max 10MB)
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95"
          >
            <MousePointerClick size={18} /> 파일 찾아보기
          </button>
        </div>
      )}

      {/* 배경 장식 원 */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 transition-opacity group-hover:opacity-100" />
    </div>
  );
};

export default ImageUploadZone;
