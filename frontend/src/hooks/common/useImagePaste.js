import { useCallback } from "react";

/**
 * 이미지 붙여넣기 처리를 위한 커스텀 훅
 * @param {Function} onImagePaste - 이미지가 붙여넣어졌을 때 호출되는 콜백
 *   (imageTag, file) => void
 * @param {Function} onFileAdd - 파일을 파일 리스트에 추가하는 콜백
 *   (file) => void
 * @returns {Function} onPaste 핸들러 함수
 */
const useImagePaste = (onImagePaste, onFileAdd) => {
  const handlePaste = useCallback(
    async (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const imageUrl = event.target.result;
            const imageTag = `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
            onImagePaste(imageTag, file);
          };
          reader.readAsDataURL(file);

          // 파일도 함께 첨부
          if (onFileAdd) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            onFileAdd(Array.from(dataTransfer.files));
          }
        }
      }
    },
    [onImagePaste, onFileAdd]
  );

  return handlePaste;
};

export default useImagePaste;

