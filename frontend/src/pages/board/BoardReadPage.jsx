import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Edit3,
  Trash2,
  User,
  Calendar,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  fetchBoardDetail,
  selectBoardDetail,
} from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/board/useBoardRouteParams";
import CommentSection from "../../components/comment/CommentSection";
import { formatDateTime } from "../../util/dateUtil";
import { getCurrentMember } from "../../api/memberApi";
import { deleteBoard } from "../../api/boardApi";
import FileItem from "../../components/common/FileItem";
import { confirmAlert, showAlert } from "../../hooks/common/useAlert";

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
    const confirmed = await confirmAlert("정말 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }
    try {
      await deleteBoard({ brandId, boardId });
      navigate(`/app/${brandId}/board/discussion${location.search}`);
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      await showAlert("게시글 삭제에 실패했습니다.", "error");
    }
  };

  const goModify = () => {
    navigate(`/app/${brandId}/board/discussion/modify/${boardId}`);
  };

  if (!detail)
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* 게시글 내용 (헤더, 본문, 첨부 파일 통합) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex-1">
              {detail.title}
            </h1>
            {currentUserId &&
              Number(detail.writerId) === Number(currentUserId) && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={goModify}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100"
                  >
                    <Edit3 size={16} />
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              <span className="font-bold">{detail.writerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span>{formatDateTime(detail.createdAt)}</span>
              {detail.updatedAt && detail.updatedAt !== detail.createdAt && (
                <span className="text-slate-400">
                  (수정됨: {formatDateTime(detail.updatedAt)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-8 py-8">
          <div
            className="prose max-w-none text-slate-800 leading-relaxed text-base"
            dangerouslySetInnerHTML={{
              __html: (detail.content || "").replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {/* 첨부 파일 */}
        {detail.files?.length > 0 && (
          <div className="px-8 pb-8 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                <FileText size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900">첨부 파일</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {detail.files.map((file) => (
                <FileItem key={file.id} file={file} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 댓글 섹션 (별도 카드로 분리) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <CommentSection brandId={brandId} boardId={boardId} />
        </div>
      </div>
    </div>
  );
};

export default BoardReadPage;
