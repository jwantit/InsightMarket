import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {fetchBoardDetail,selectBoardDetail,} from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";
import CommentSection from "../../components/comment/CommentSection";
import { formatDateTime } from "../../util/dateUtil";
import { API_SERVER_HOST } from "../../api/memberApi";

const BoardReadPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, boardId } = useBoardRouteParams();
  const detail = useSelector((state) => selectBoardDetail(state, boardId));

  useEffect(() => {
    if (brandId && boardId) {
      console.log("게시글 상세 조회:", { brandId, boardId });
      dispatch(fetchBoardDetail({ brandId, boardId })).then((result) => {
        if (fetchBoardDetail.fulfilled.match(result)) {
          console.log("게시글 상세 조회 성공:", result.payload);
        } else if (fetchBoardDetail.rejected.match(result)) {
          console.error("게시글 상세 조회 실패:", result.error);
        }
      });
    }
  }, [brandId, boardId, dispatch]);

  useEffect(() => {
    console.log("게시글 상세 데이터:", detail);
  }, [detail]);

  const backToList = () => {
    navigate(`/app/${brandId}/board/discussion${location.search}`);
  };

  const goModify = () => {
    navigate(`/app/${brandId}/board/discussion/modify/${boardId}`);
  };

  if (!detail)
    return (
      <div className="py-12 text-center text-gray-500">불러오는 중...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <button
          onClick={backToList}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          목록으로
        </button>
        <button
          onClick={goModify}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          수정
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {detail.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b">
            <span className="font-medium">작성자: {detail.writerName}</span>
            <span className="text-gray-500">
              등록일: {formatDateTime(detail.createdAt)}
              {detail.updatedAt && 
               detail.updatedAt !== detail.createdAt && 
               ` (수정됨: ${formatDateTime(detail.updatedAt)})`}
            </span>
          </div>
        </div>

        <div
          className="prose max-w-none py-6 text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: detail.content.replace(/\n/g, '<br>') }}
        />

        {detail.files?.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">첨부 파일</h4>
            <ul className="space-y-2">
              {detail.files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">{file.originalName}</span>
                  <button
                    onClick={() => window.open(`${API_SERVER_HOST}/api/files/${file.id}`, "_blank")}
                    className="ml-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    다운로드
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-6 border-t">
        <CommentSection brandId={brandId} boardId={boardId} />
      </div>
    </div>
  );
};

export default BoardReadPage;