import React, { useEffect, useMemo, useRef } from "react";
import { formatDateTime } from "../../util/dateUtil";
import FileItem from "../common/FileItem";
import useKeepFiles from "../../hooks/common/useKeepFiles";

const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  editingId,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  parentId,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  parentInfo,
  originalCommentId,
  currentUserId,
  editFiles,
  onEditFilesChange,
  getReplyFiles,
  setReplyFilesForComment,
  getEditFiles,
  setEditFilesForComment,
}) => {
  const isEditing = editingId === comment.commentId;
  const isReplying = parentId === comment.commentId;
  const hasParentComment = comment.parentCommentId && parentInfo;

  // 대댓글에 답글을 달 때는 원래 댓글을 부모로 사용
  const actualTargetId = originalCommentId || comment.commentId;

  // 답글 작성 중일 때 현재 commentId의 replyFiles 가져오기
  const currentReplyFiles = isReplying && getReplyFiles
    ? getReplyFiles(comment.commentId)
    : [];

  // 수정 모드일 때 기존 파일 관리 (keepFileIds)
  const existingFiles = useMemo(
    () => (comment.files && Array.isArray(comment.files) ? comment.files : []),
    [comment.files]
  );
  const { keepFileIds, toggleKeep, resetKeep } = useKeepFiles(existingFiles);

  // 수정 모드 시작 시 keepFileIds 초기화 (한 번만)
  const prevEditingIdRef = useRef(null);
  useEffect(() => {
    if (isEditing && prevEditingIdRef.current !== comment.commentId) {
      resetKeep();
      prevEditingIdRef.current = comment.commentId;
    } else if (!isEditing) {
      prevEditingIdRef.current = null;
    }
  }, [isEditing, comment.commentId, resetKeep]);

  // 이미지 붙여넣기 핸들러
  const handleImagePaste = async (
    e,
    onContentChange,
    onFilesChange,
    currentContent
  ) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target.result;
          const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
          onContentChange(
            currentContent + (currentContent ? "\n" : "") + imageTag
          );
        };
        reader.readAsDataURL(file);

        // 파일도 함께 첨부
        if (onFilesChange) {
          onFilesChange((prev) => [...prev, file]);
        }
      }
    }
  };

  return (
    <div className="mb-4 pb-4 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <strong className="text-sm font-semibold text-gray-900">
          {comment.writerName || comment.writerId}
        </strong>
        <span className="text-xs text-gray-500">
          {formatDateTime(comment.createdAt)}
          {comment.updatedAt &&
            comment.updatedAt !== comment.createdAt &&
            ` (수정됨: ${formatDateTime(comment.updatedAt)})`}
        </span>
      </div>
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            onPaste={(e) =>
              handleImagePaste(
                e,
                onEditContentChange,
                onEditFilesChange,
                editContent
              )
            }
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="댓글 내용을 입력하세요 (이미지 붙여넣기 및 드래그앤드롭 가능)"
          />
          {/* 기존 파일 목록 (체크박스로 삭제 선택) */}
          {existingFiles.length > 0 && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">
                기존 파일
              </h5>
              <div className="space-y-1.5">
                {existingFiles.map((file) => (
                  <label
                    key={file.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={keepFileIds.includes(file.id)}
                      onChange={() => toggleKeep(file.id)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <FileItem file={file} size="sm" />
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* 새로 추가된 파일 목록 */}
          {editFiles &&
            Array.from(editFiles).filter((f) => f instanceof File).length >
              0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-gray-700">
                  새로 추가할 파일
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(editFiles)
                    .filter((f) => f instanceof File)
                    .map((file, index) => (
                      <FileItem
                        key={index}
                        file={file}
                        size="sm"
                        onRemove={() => {
                          if (onEditFilesChange) {
                            // File 객체만 필터링하여 제거
                            const fileList = Array.from(editFiles);
                            const newFiles = fileList.filter(
                              (f, i) =>
                                !(f instanceof File) ||
                                fileList.indexOf(f) !== index
                            );
                            onEditFilesChange(newFiles);
                          }
                        }}
                      />
                    ))}
                </div>
              </div>
            )}
          <div className="mt-2">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (onEditFilesChange && e.target.files) {
                  onEditFilesChange((prev) => [
                    ...prev,
                    ...Array.from(e.target.files),
                  ]);
                }
              }}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveEdit(keepFileIds)}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-800 mb-3">
            {hasParentComment && (
              <span className="text-blue-600 font-medium mr-2">
                @{parentInfo.writerName || parentInfo.writerId}
              </span>
            )}
            <div
              dangerouslySetInnerHTML={{
                __html: comment.content.replace(/\n/g, "<br>"),
              }}
            />
          </div>
          {comment.files &&
            Array.isArray(comment.files) &&
            comment.files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {comment.files.map((f) => (
                  <FileItem key={f.id} file={f} size="sm" />
                ))}
              </div>
            )}
          <div className="flex gap-2">
            <button
              onClick={() => onReply(comment.commentId)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              답글
            </button>
            {currentUserId &&
              Number(comment.writerId) === Number(currentUserId) && (
                <>
                  <button
                    onClick={() => onEdit(comment)}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(comment.commentId)}
                    className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
          </div>
        </>
      )}
      {isReplying && (
        <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-2">
            <span className="text-sm text-blue-600 font-medium">
              @{comment.writerName || comment.writerId}님에게 답글
            </span>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const droppedFiles = Array.from(e.dataTransfer.files);
              if (droppedFiles.length > 0 && setReplyFilesForComment) {
                setReplyFilesForComment(comment.commentId, (prev) => [
                  ...prev,
                  ...droppedFiles,
                ]);
              }
            }}
          >
            <textarea
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              onPaste={(e) => {
                handleImagePaste(
                  e,
                  onReplyContentChange,
                  (updater) => {
                    if (setReplyFilesForComment) {
                      setReplyFilesForComment(comment.commentId, updater);
                    }
                  },
                  replyContent
                );
              }}
              placeholder="답글을 입력하세요 (이미지 붙여넣기 및 드래그앤드롭 가능)"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            />
            {currentReplyFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentReplyFiles.map((file, index) => (
                  <FileItem
                    key={index}
                    file={file}
                    size="sm"
                    onRemove={() => {
                      if (setReplyFilesForComment) {
                        setReplyFilesForComment(comment.commentId, (prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }
                    }}
                  />
                ))}
              </div>
            )}
            <div className="mt-2">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files && setReplyFilesForComment) {
                    const newFiles = Array.from(e.target.files);
                    setReplyFilesForComment(comment.commentId, (prev) => [
                      ...prev,
                      ...newFiles,
                    ]);
                  }
                }}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onSubmitReply(actualTargetId, replyContent)}
              disabled={!replyContent || !replyContent.trim()}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              등록
            </button>
            <button
              onClick={onCancelReply}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
      {comment.replies?.length > 0 && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              editingId={editingId}
              editContent={editContent}
              onEditContentChange={onEditContentChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              parentId={parentId}
              replyContent={replyContent}
              onReplyContentChange={onReplyContentChange}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              parentInfo={comment}
              originalCommentId={comment.commentId}
              currentUserId={currentUserId}
              editFiles={getEditFiles ? getEditFiles(reply.commentId) : []}
              onEditFilesChange={
                setEditFilesForComment
                  ? (updater) => setEditFilesForComment(reply.commentId, updater)
                  : undefined
              }
              getReplyFiles={getReplyFiles}
              setReplyFilesForComment={setReplyFilesForComment}
              getEditFiles={getEditFiles}
              setEditFilesForComment={setEditFilesForComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
