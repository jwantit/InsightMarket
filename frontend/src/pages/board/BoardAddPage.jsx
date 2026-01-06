import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Save, X, FileText, Image as ImageIcon } from "lucide-react";
import { createBoardThunk } from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";
import useFileUpload from "../../hooks/common/useFileUpload";
import useImagePasteToContent from "../../hooks/common/useImagePasteToContent";
import FileUploadZone from "../../components/common/FileUploadZone";

const BoardAddPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { brandId } = useBoardRouteParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const {
    files,
    isDragging,
    fileInputRef,
    dropZoneRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    openFileDialog,
  } = useFileUpload();

  const handlePaste = useImagePasteToContent(setContent, handleFileChange);

  const onSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(
      createBoardThunk({
        brandId,
        payload: { data: { title, content }, files: Array.from(files) },
      })
    );

    if (createBoardThunk.fulfilled.match(resultAction)) {
      const newBoard = resultAction.payload;
      navigate(`/app/${brandId}/board/discussion/read/${newBoard.id}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <form onSubmit={onSubmit} className="space-y-6 p-6">
        {/* 제목 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
            placeholder="내용을 입력하세요 (이미지 붙여넣기 가능)"
          />
        </div>

        {/* 파일 업로드 */}
        <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">첨부 파일</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                파일을 드래그하거나 클릭하여 업로드하세요.
              </p>
            </div>
          </div>
          <div className="p-6">
            <FileUploadZone
              fileInputRef={fileInputRef}
              dropZoneRef={dropZoneRef}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onOpenFileDialog={openFileDialog}
              files={files}
              onRemoveFile={removeFile}
              label="파일"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!title || !content}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Save size={18} />
            게시글 등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardAddPage;