import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {fetchBoardDetail,selectBoardDetail,updateBoardThunk,} from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";
import useKeepFiles from "../../hooks/common/useKeepFiles";
import useFileUpload from "../../hooks/common/useFileUpload";
import useImagePasteToContent from "../../hooks/common/useImagePasteToContent";
import FileUploadZone from "../../components/common/FileUploadZone";

const BoardModifyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { brandId, boardId } = useBoardRouteParams();

  const detail = useSelector((state) => selectBoardDetail(state, boardId));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const initializedRef = useRef(false);
  const { keepFileIds, toggleKeep, resetKeep } = useKeepFiles(
    detail?.files || []
  );

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

  useEffect(() => {
    dispatch(fetchBoardDetail({ brandId, boardId }));
    initializedRef.current = false;
  }, [brandId, boardId, dispatch]);

  useEffect(() => {
    if (detail && detail.id === Number(boardId) && !initializedRef.current) {
      setTitle(detail.title);
      setContent(detail.content);
      resetKeep();
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id, boardId]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(
        updateBoardThunk({
          brandId,
          boardId,
          payload: {
            data: { title, content, keepFileIds, writerId: detail.writerId },
            files: Array.from(files),
          },
        })
      );

      if (updateBoardThunk.fulfilled.match(resultAction)) {
        navigate(`/app/${brandId}/board/discussion/read/${boardId}`);
      } else if (updateBoardThunk.rejected.match(resultAction)) {
        console.error("게시글 수정 실패:", resultAction.error);
        alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  if (!detail)
    return (
      <div className="py-12 text-center text-gray-500">불러오는 중...</div>
    );

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
      {(detail.files || []).length > 0 && (
        <div>
          <h4 className="block text-sm font-medium text-gray-700 mb-3">
            기존 파일
          </h4>
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {(detail.files || []).map((file) => (
              <label
                key={file.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={keepFileIds.includes(file.id)}
                  onChange={() => toggleKeep(file.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{file.originalName}</span>
              </label>
            ))}
          </div>
        </div>
      )}
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
        label="신규 파일"
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
          수정
        </button>
      </div>
    </form>
  );
};

export default BoardModifyPage;