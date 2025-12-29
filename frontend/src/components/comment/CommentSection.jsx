import React, { useState, useEffect } from "react";
import useComments from "../../hooks/comment/useComments";
import { getCurrentMember } from "../../api/memberApi";
import useCommentFileState from "../../hooks/comment/useCommentFileState";
import CommentItem from "./CommentItem";

const CommentSection = ({ brandId, boardId }) => {
  const { tree, status, createComment, updateComment, deleteComment } = useComments(
    brandId,
    boardId
  );
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 댓글 전체 정보 저장
  const [editContent, setEditContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [commentFiles, setCommentFiles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // 파일 상태 관리 훅
  const {
    getEditFiles,
    setEditFilesForComment,
    clearEditFiles,
    initEditFiles,
    getReplyFiles,
    setReplyFilesForComment,
    clearReplyFiles,
  } = useCommentFileState();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentMember();
        setCurrentUserId(user.memberId);
      } catch (error) {
        // 사용자 정보 조회 실패 시 무시
      }
    };
    fetchCurrentUser();
  }, []);

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
    if (!content || !content.trim()) return;
    try {
      const files = getReplyFiles(targetCommentId);
      await createComment({
        data: { content: content.trim(), parentCommentId: targetCommentId, keepFileIds: null },
        files: Array.from(files),
      });
      setReplyContent("");
      setParentId(null);
      clearReplyFiles(targetCommentId);
    } catch (error) {
      alert("답글 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };


  const handleEdit = (comment) => {
    if (editingId) {
      // 이미 수정 중인 댓글이 있으면 취소
      handleCancelEdit();
    }
    setEditingId(comment.commentId);
    setEditingComment(comment); // 댓글 전체 정보 저장 (writerId 포함)
    setEditContent(comment.content);
    setParentId(null); // 답글 모드 해제
    initEditFiles(comment.commentId);
  };

  const handleReply = (id) => {
    if (editingId) {
      // 수정 모드일 때는 수정 취소
      handleCancelEdit();
    }
    setParentId(id);
    setReplyContent("");
    setContent(""); // 상단 폼 초기화
    // 답글 모드 시작 시 해당 commentId의 replyFiles 초기화
    setReplyFilesForComment(id, []);
  };

  const handleCancelReply = () => {
    const currentParentId = parentId;
    setParentId(null);
    setReplyContent("");
    if (currentParentId) {
      clearReplyFiles(currentParentId);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const files = getEditFiles(editingId);
      await updateComment(editingId, {
        data: { 
          content: editContent, 
          keepFileIds: null,
          writerId: editingComment?.writerId // @PreAuthorize를 위한 writerId
        },
        files: Array.from(files),
      });
      setEditingId(null);
      setEditingComment(null);
      setEditContent("");
      clearEditFiles(editingId);
    } catch (error) {
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancelEdit = () => {
    const currentEditingId = editingId;
    setEditingId(null);
    setEditingComment(null);
    setEditContent("");
    if (currentEditingId) {
      clearEditFiles(currentEditingId);
    }
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
              currentUserId={currentUserId}
              replyFiles={getReplyFiles(comment.commentId)}
              onReplyFilesChange={(updater) => setReplyFilesForComment(comment.commentId, updater)}
              editFiles={getEditFiles(comment.commentId)}
              onEditFilesChange={(updater) => setEditFilesForComment(comment.commentId, updater)}
              getReplyFiles={getReplyFiles}
              setReplyFilesForComment={setReplyFilesForComment}
              getEditFiles={getEditFiles}
              setEditFilesForComment={setEditFilesForComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;