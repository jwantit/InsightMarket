import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Save, X, FileText, Image as ImageIcon } from "lucide-react";
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
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      </div>
    );

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

        {/* 기존 파일 */}
        {(detail.files || []).length > 0 && (
          <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">기존 파일</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  유지할 파일을 선택하세요.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-2">
              {(detail.files || []).map((file) => (
                <label
                  key={file.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={keepFileIds.includes(file.id)}
                    onChange={() => toggleKeep(file.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{file.originalName}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 신규 파일 업로드 */}
        <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">신규 파일</h3>
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
              label="신규 파일"
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
            변경사항 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardModifyPage;