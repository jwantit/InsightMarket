import { useState } from "react";

/**
 * 댓글/답글 파일 상태 관리를 위한 커스텀 훅
 * commentId별로 파일을 독립적으로 관리
 */
const useCommentFileState = () => {
  const [editFilesMap, setEditFilesMap] = useState(new Map());
  const [replyFilesMap, setReplyFilesMap] = useState(new Map());

  // editFiles 관련 함수
  const getEditFiles = (commentId) => editFilesMap.get(commentId) || [];
  
  const setEditFilesForComment = (commentId, updater) => {
    setEditFilesMap((prev) => {
      const newMap = new Map(prev);
      const currentFiles = newMap.get(commentId) || [];
      const updatedFiles = typeof updater === 'function' 
        ? updater(currentFiles) 
        : updater;
      newMap.set(commentId, updatedFiles);
      return newMap;
    });
  };

  const clearEditFiles = (commentId) => {
    setEditFilesMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(commentId);
      return newMap;
    });
  };

  const initEditFiles = (commentId) => {
    setEditFilesMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(commentId, []);
      return newMap;
    });
  };

  // replyFiles 관련 함수
  const getReplyFiles = (commentId) => replyFilesMap.get(commentId) || [];
  
  const setReplyFilesForComment = (commentId, updater) => {
    setReplyFilesMap((prev) => {
      const newMap = new Map(prev);
      const currentFiles = newMap.get(commentId) || [];
      const updatedFiles = typeof updater === 'function' 
        ? updater(currentFiles) 
        : updater;
      newMap.set(commentId, updatedFiles);
      return newMap;
    });
  };

  const clearReplyFiles = (commentId) => {
    setReplyFilesMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(commentId);
      return newMap;
    });
  };

  return {
    // Edit files
    getEditFiles,
    setEditFilesForComment,
    clearEditFiles,
    initEditFiles,
    // Reply files
    getReplyFiles,
    setReplyFilesForComment,
    clearReplyFiles,
  };
};

export default useCommentFileState;

