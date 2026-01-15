import React from "react";

/**
 * 파일 업로드 영역 컴포넌트
 * 드래그앤드롭 및 파일 선택 기능 제공
 */
const FileUploadZone = ({
  fileInputRef,
  dropZoneRef,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onOpenFileDialog,
  files = [],
  onRemoveFile,
  label = "파일",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        ref={dropZoneRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => onFileChange(e.target.files)}
          className="hidden"
        />
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            파일을 드래그하여 놓거나 클릭하여 선택하세요
          </p>
          <button
            type="button"
            onClick={onOpenFileDialog}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            파일 선택
          </button>
        </div>
        {files.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">선택된 파일 ({files.length}개):</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Array.from(files).map((file, index) => (
                <div key={index} className="text-xs text-gray-700 flex items-center justify-between">
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;

