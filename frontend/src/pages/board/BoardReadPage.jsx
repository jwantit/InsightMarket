import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {fetchBoardDetail,selectBoardDetail,} from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";
import CommentSection from "../../components/comment/CommentSection";
import { formatDateTime } from "../../util/dateUtil";
import { getCurrentMember } from "../../api/memberApi";
import { deleteBoard } from "../../api/boardApi";
import FileItem from "../../components/common/FileItem";

const BoardReadPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { brandId, boardId } = useBoardRouteParams();
  const detail = useSelector((state) => selectBoardDetail(state, boardId));
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (brandId && boardId) {
      dispatch(fetchBoardDetail({ brandId, boardId }));
    }
  }, [brandId, boardId, dispatch]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentMember();
        setCurrentUserId(user.memberId);
      } catch (error) {
        console.error("현재 사용자 정보 조회 실패:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteBoard({ brandId, boardId });
      navigate(`/app/${brandId}/board/discussion${location.search}`);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
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
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {detail.title}
            </h3>
            {currentUserId && Number(detail.writerId) === Number(currentUserId) && (
              <div className="flex gap-2">
                <button
                  onClick={goModify}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
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
          dangerouslySetInnerHTML={{ __html: (detail.content || '').replace(/\n/g, '<br>') }}
        />

        {detail.files?.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">첨부 파일</h4>
            <div className="flex flex-wrap gap-2">
              {detail.files.map((file) => (
                <FileItem key={file.id} file={file} size="md" />
              ))}
            </div>
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