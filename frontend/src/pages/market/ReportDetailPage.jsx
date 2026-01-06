import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Package, Calendar, Tag } from "lucide-react";
import { useBrand } from "../../hooks/useBrand";
import { getPurchasedSolutionDetail } from "../../api/solutionApi";

const ReportDetailPage = () => {
  const { solutionId } = useParams();
  const { brandId } = useBrand();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        setLoading(true);
        const data = await getPurchasedSolutionDetail(solutionId);
        setSolution(data);
      } catch (err) {
        console.error("리포트 조회 실패:", err);
        setError(
          "리포트를 불러올 수 없습니다. 구매한 리포트인지 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    if (solutionId) {
      fetchSolution();
    }
  }, [solutionId]);

  const handleBack = () => {
    navigate(`/app/${brandId}/market/history`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
            <p className="text-sm text-slate-500">리포트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <FileText size={32} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">오류 발생</h2>
              <p className="text-sm text-slate-600 mb-6">{error}</p>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                <ArrowLeft size={18} />
                구매 내역으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!solution) {
    return null;
  }

  // 리포트 내용을 마크다운 형식으로 파싱하여 표시
  const formatReportContent = (content) => {
    if (!content) return "";

    // 마크다운 헤더 (#, ##, ###) 처리
    let formatted = content
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-900">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-10 mb-6 text-slate-900">$1</h1>'
      )
      // 리스트 항목 처리
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-slate-700">$1</li>')
      // 볼드 처리
      .replace(
        /\*\*(.*?)\*\*/gim,
        '<strong class="font-bold text-slate-900">$1</strong>'
      )
      // 줄바꿈 처리
      .replace(/\n/g, "<br>");

    return formatted;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {solution.title}
              </h1>
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shrink-0"
            >
              <ArrowLeft size={18} />
              목록으로
            </button>
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  프로젝트
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.projectname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Tag size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  전략
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.strategytitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  생성일
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {solution.createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 리포트 내용 */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatReportContent(solution.description),
            }}
            style={{
              lineHeight: "1.8",
              color: "#1e293b",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
