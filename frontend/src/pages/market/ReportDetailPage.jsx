import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            구매 내역으로 돌아가기
          </button>
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
        '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-10 mb-6 text-gray-900">$1</h1>'
      )
      // 리스트 항목 처리
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2 text-gray-700">$1</li>')
      // 볼드 처리
      .replace(
        /\*\*(.*?)\*\*/gim,
        '<strong class="font-bold text-gray-900">$1</strong>'
      )
      // 줄바꿈 처리
      .replace(/\n/g, "<br>");

    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-gray-900">
              {solution.title}
            </h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              ← 목록으로
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">P</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  프로젝트
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {solution.projectname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">S</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  전략
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {solution.strategytitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs">📅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  생성일
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {solution.createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 리포트 내용 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatReportContent(solution.description),
            }}
            style={{
              lineHeight: "1.8",
              color: "#374151",
            }}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-300 shadow-lg"
          >
            구매 내역으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
