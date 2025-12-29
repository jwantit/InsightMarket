import { useState, useRef } from "react";

/**
 * 파일 업로드를 위한 커스텀 훅
 * 드래그앤드롭 및 파일 선택 기능 제공
 * @returns {Object} 파일 업로드 관련 상태와 핸들러
 */
const useFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleFileChange = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const currentFiles = Array.from(files);
    setFiles([...currentFiles, ...fileArray]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  const removeFile = (index) => {
    const newFiles = Array.from(files);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return {
    files,
    setFiles,
    isDragging,
    fileInputRef,
    dropZoneRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    clearFiles,
    openFileDialog,
  };
};

export default useFileUpload;

