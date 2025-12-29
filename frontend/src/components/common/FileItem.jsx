import React from "react";
import { API_SERVER_HOST } from "../../api/memberApi";
import jwtAxios from "../../util/jwtUtil";

/**
 * 파일 아이템 컴포넌트
 * 파일 다운로드 버튼 표시 (기존 파일) 또는 파일명 표시 (새 파일)
 */
const FileItem = ({ file, size = "sm", onClick, onRemove }) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  };

  const maxWidths = {
    sm: "max-w-[150px]",
    md: "max-w-[200px]",
  };

  // 새 파일(File 객체)인지 기존 파일(DTO)인지 확인
  const isNewFile = file instanceof File;
  const fileName = isNewFile ? file.name : (file.originalName || file.name);

  const handleClick = async (e) => {
    if (onClick) {
      onClick(e);
    } else if (!isNewFile && file.id) {
      try {
        // jwtAxios를 사용하여 파일 다운로드 (JWT 토큰 포함)
        const response = await jwtAxios.get(
          `${API_SERVER_HOST}/api/files/${file.id}`,
          {
            responseType: 'blob', // blob으로 응답 받기
          }
        );
        
        // Blob URL 생성
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        
        // 다운로드 링크 생성 및 클릭
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // 정리
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("파일 다운로드 실패:", error);
        alert("파일 다운로드에 실패했습니다.");
      }
    }
  };

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded transition-colors ${isNewFile ? 'cursor-default' : 'cursor-pointer'}`}>
      <button
        onClick={handleClick}
        className="flex items-center flex-1 min-w-0"
        title={fileName}
      >
        <svg
          className={`${iconSizes[size]} text-gray-500 flex-shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81"
          />
        </svg>
        <span className={`${maxWidths[size]} truncate`}>{fileName}</span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-red-600 hover:text-red-800 flex-shrink-0"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default FileItem;

