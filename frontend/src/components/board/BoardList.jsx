import React from "react";
import { formatDateTime } from "../../util/dateUtil";
import { API_SERVER_HOST } from "../../api/memberApi";

const BoardList = ({ items = [], onClickItem }) => {
  const handleFileDownload = (e, fileId) => {
    e.stopPropagation(); // 행 클릭 이벤트 방지
    window.open(`${API_SERVER_HOST}/api/files/${fileId}`, "_blank");
  };

  if (!items.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        게시글이 없습니다.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              제목
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
              썸네일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
              작성자
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">
              등록일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
              첨부
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onClickItem?.(item.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  <span>{item.title}</span>
                  {item.commentCount !== undefined && item.commentCount > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      [{item.commentCount}]
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {(() => {
                  // 첫 번째 이미지 파일 찾기 (hasThumbnail이 true인 파일만)
                  const firstImageFile = item.files?.find(f => f.hasThumbnail === true);
                  
                  if (firstImageFile) {
                    return (
                      <div className="flex items-center gap-2">
                        <img
                          key={firstImageFile.id}
                          src={`${API_SERVER_HOST}/api/files/${firstImageFile.id}/thumbnail`}
                          alt="썸네일"
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(e, firstImageFile.id);
                          }}
                          onError={(e) => {
                            console.error('썸네일 로드 실패:', firstImageFile.id, firstImageFile);
                            e.target.style.display = 'none';
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    );
                  }
                  
                  return <span className="text-gray-400 text-xs">-</span>;
                })()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.writerName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDateTime(item.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {item.files && item.files.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">
                      📎 {item.files.length}
                    </span>
                    {item.files.map((file) => (
                      <button
                        key={file.id}
                        onClick={(e) => handleFileDownload(e, file.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title={file.originalName}
                      >
                        첨부
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoardList;

