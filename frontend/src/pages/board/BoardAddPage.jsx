import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="제목을 입력하세요"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={handlePaste}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="내용을 입력하세요 (이미지 붙여넣기 가능)"
        />
      </div>
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
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!title || !content}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          등록
        </button>
      </div>
    </form>
  );
};

export default BoardAddPage;