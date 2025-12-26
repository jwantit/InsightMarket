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
              <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
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

