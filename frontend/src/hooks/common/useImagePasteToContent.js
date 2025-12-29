import { useCallback } from "react";

/**
 * 텍스트 영역에 이미지를 붙여넣을 때 처리하는 커스텀 훅
 * @param {Function} setContent - 콘텐츠 상태 업데이트 함수
 * @param {Function} handleFileChange - 파일 추가 함수 (FileList를 받음)
 * @returns {Function} onPaste 핸들러 함수
 */
const useImagePasteToContent = (setContent, handleFileChange) => {
  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target.result;
            const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
            setContent((prev) => prev + (prev ? "\n" : "") + imageTag);
          };
          reader.readAsDataURL(file);

          // 파일도 함께 첨부
          if (handleFileChange) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            handleFileChange(dataTransfer.files);
          }
        }
      }
    },
    [setContent, handleFileChange]
  );

  return handlePaste;
};

export default useImagePasteToContent;

