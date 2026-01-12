import React from "react";
import { formatDateTime } from "../../util/dateUtil";
import { API_SERVER_HOST } from "../../api/memberApi";
import { FileText, MessageCircle, Paperclip } from "lucide-react";

const BoardListComponent = ({ items = [], onClickItem }) => {
  const handleFileDownload = (e, fileId) => {
    e.stopPropagation();
    window.open(`${API_SERVER_HOST}/api/files/${fileId}`, "_blank");
  };

  if (!items.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <FileText size={32} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              등록된 게시글이 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              첫 번째 게시글을 작성해보세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                번호
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-24">
                썸네일
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-32">
                작성자
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-40">
                등록일
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-20">
                첨부
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {items.map((item) => {
              const firstImageFile = item.files?.find(f => f.hasThumbnail === true);
              
              return (
                <tr
                  key={item.id}
                  onClick={() => onClickItem?.(item.id)}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group h-16"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {item.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center h-full">
                      {firstImageFile ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={`${API_SERVER_HOST}/api/files/${firstImageFile.id}/thumbnail`}
                            alt="썸네일"
                            className="w-full h-full object-cover"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDownload(e, firstImageFile.id);
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </span>
                      {item.commentCount !== undefined && item.commentCount > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                          <MessageCircle size={14} />
                          <span>{item.commentCount}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {item.writerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {item.files && item.files.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Paperclip size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">
                          {item.files.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoardListComponent;

