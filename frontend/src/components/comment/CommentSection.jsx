import React, { useState } from "react";
import useComments from "../../hooks/comment/useComments";
import { formatDateTime } from "../../util/dateUtil";
import { API_SERVER_HOST } from "../../api/memberApi";

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
  targetCommentId,
  originalCommentId,
}) => {
  const isEditing = editingId === comment.commentId;
  const isReplying = parentId === comment.commentId;
  const hasParentComment = comment.parentCommentId && parentInfo;
  
  // 대댓글에 답글을 달 때는 원래 댓글을 부모로 사용
  const actualTargetId = originalCommentId || targetCommentId || comment.commentId;

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
            onPaste={async (e) => {
              const items = e.clipboardData.items;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                  e.preventDefault();
                  const file = items[i].getAsFile();
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
                    onEditContentChange(editContent + (editContent ? '\n' : '') + imageTag);
                  };
                  reader.readAsDataURL(file);
                  
                  // 파일도 함께 첨부
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  setEditFiles((prev) => [...prev, ...Array.from(dataTransfer.files)]);
                }
              }
            }}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="댓글 내용을 입력하세요 (이미지 붙여넣기 가능)"
          />
          <div className="flex gap-2">
            <button
              onClick={onSaveEdit}
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
            <div dangerouslySetInnerHTML={{ __html: comment.content.replace(/\n/g, '<br>') }} />
          </div>
          {comment.files?.length > 0 && (
            <ul className="mb-3 space-y-1">
              {comment.files.map((f) => (
                <li
                  key={f.id}
                  className="text-xs text-gray-600 p-2 bg-gray-50 rounded inline-flex items-center gap-2 mr-2"
                >
                  <span>{f.originalName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`${API_SERVER_HOST}/api/files/${f.id}`, "_blank");
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="다운로드"
                  >
                    첨부
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onReply(comment.commentId)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              답글
            </button>
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
          <textarea
            value={replyContent}
            onChange={(e) => onReplyContentChange(e.target.value)}
            onPaste={async (e) => {
              const items = e.clipboardData.items;
              for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                  e.preventDefault();
                  const file = items[i].getAsFile();
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
                    onReplyContentChange(replyContent + (replyContent ? '\n' : '') + imageTag);
                  };
                  reader.readAsDataURL(file);
                  
                  // 파일도 함께 첨부
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  setReplyFiles((prev) => [...prev, ...Array.from(dataTransfer.files)]);
                }
              }
            }}
            placeholder="답글을 입력하세요 (이미지 붙여넣기 가능)"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                if (onSubmitReply && typeof onSubmitReply === 'function') {
                  onSubmitReply(actualTargetId, replyContent);
                }
              }}
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
          {comment.replies.map((reply) => {
            // 부모 댓글 정보 찾기 (comment가 reply의 부모)
            const replyParentInfo = comment;
            return (
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
                parentInfo={replyParentInfo}
                targetCommentId={reply.commentId}
                originalCommentId={comment.commentId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ brandId, boardId }) => {
  const { tree, status, createComment, updateComment, deleteComment } = useComments(
    brandId,
    boardId
  );
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [commentFiles, setCommentFiles] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [replyFiles, setReplyFiles] = useState([]);

  const submit = async () => {
    await createComment({
      data: { content, parentCommentId: null, keepFileIds: null },
      files: Array.from(commentFiles),
    });
    setContent("");
    setParentId(null);
    setCommentFiles([]);
  };

  const submitReply = async (targetCommentId, content) => {
    if (!content || !content.trim()) {
      console.log("답글 내용이 비어있습니다.");
      return;
    }
    try {
      console.log("답글 등록 시도:", { targetCommentId, content });
      await createComment({
        data: { content: content.trim(), parentCommentId: targetCommentId, keepFileIds: null },
        files: Array.from(replyFiles),
      });
      console.log("답글 등록 성공");
      setReplyContent("");
      setParentId(null);
      setReplyFiles([]);
    } catch (error) {
      console.error("답글 등록 실패:", error);
      alert("답글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };


  const handleEdit = (comment) => {
    if (editingId) {
      // 이미 수정 중인 댓글이 있으면 취소
      handleCancelEdit();
    }
    setEditingId(comment.commentId);
    setEditContent(comment.content);
    setParentId(null); // 답글 모드 해제
  };

  const handleReply = (id) => {
    if (editingId) {
      // 수정 모드일 때는 수정 취소
      handleCancelEdit();
    }
    setParentId(id);
    setReplyContent("");
    setContent(""); // 상단 폼 초기화
  };

  const handleCancelReply = () => {
    setParentId(null);
    setReplyContent("");
    setReplyFiles([]);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await updateComment(editingId, {
      data: { content: editContent, keepFileIds: null },
      files: Array.from(editFiles),
    });
    setEditingId(null);
    setEditContent("");
    setEditFiles([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditFiles([]);
  };

  const handleDelete = async (id) => {
    await deleteComment(id);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">댓글</h4>
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onPaste={async (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf("image") !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imageUrl = event.target.result;
                  const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
                  setContent((prev) => prev + (prev ? '\n' : '') + imageTag);
                };
                reader.readAsDataURL(file);
                
                // 파일도 함께 첨부
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                setCommentFiles((prev) => [...prev, ...Array.from(dataTransfer.files)]);
              }
            }
          }}
          placeholder="댓글 작성... (이미지 붙여넣기 가능)"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
        />
        {commentFiles.length > 0 && (
          <div className="text-xs text-gray-600">
            첨부된 파일: {commentFiles.map(f => f.name).join(", ")}
          </div>
        )}
        <div className="flex items-center justify-between">
          <input
            type="file"
            multiple
            onChange={(e) => setCommentFiles(Array.from(e.target.files || []))}
            className="block text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={submit}
            disabled={!content}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            등록
          </button>
        </div>
      </div>
      <div className="mt-6">
        {status === "loading" ? (
          <div className="py-8 text-center text-gray-500">불러오는 중...</div>
        ) : tree.length === 0 ? (
          <div className="py-8 text-center text-gray-500">댓글이 없습니다.</div>
        ) : (
          tree.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
              editingId={editingId}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              parentId={parentId}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onSubmitReply={submitReply}
              onCancelReply={handleCancelReply}
              targetCommentId={comment.commentId}
              originalCommentId={comment.commentId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;