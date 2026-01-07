import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBrand } from "../../hooks/useBrand";
import { requestMarketBotGuide, getErrorMessage } from "../../api/marketBotApi";
import SolutionDetailModal from "../../components/ai/SolutionDetailModal";

// 공통 헤더 컴포넌트
const MarketBotHeader = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-sm border mb-6">
    <div className="px-6 py-5 border-b flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">상권 분석 봇 (Beta)</h1>
        <p className="text-sm text-gray-600 mt-1">
          주변 매장 분석을 기반으로 창업 가이드를 제공합니다.
        </p>
      </div>
      <button className="text-gray-400 hover:text-gray-600 text-2xl">⋮</button>
    </div>
    {children}
  </div>
);

const MarketBotGuidePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { brandId } = useBrand();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guideData, setGuideData] = useState(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);

  // location.state에서 데이터 가져오기
  const resultData = location.state?.resultData;

  useEffect(() => {
    if (!resultData) {
      navigate(`/app/${brandId}/ai/marketbot`, { replace: true });
      return;
    }

    // 창업 가이드 데이터 요청
    fetchGuideData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultData, navigate, brandId]);

  const fetchGuideData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await requestMarketBotGuide(resultData);
      setGuideData(data);
      setLoading(false);
    } catch (err) {
      console.error("[MarketBotGuidePage] 가이드 데이터 조회 오류:", err);
      setError(getErrorMessage(err, "창업 가이드를 불러올 수 없습니다."));
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/app/${brandId}/ai/marketbot/result`, {
      state: { resultData },
    });
  };

  const handleDownloadReport = () => {
    // TODO: PDF 다운로드 기능 구현
    console.log("상세 리포트 다운로드");
    alert("상세 리포트 다운로드 기능은 준비 중입니다.");
  };

  if (!resultData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MarketBotHeader />

        {/* 창업 제언 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">창업 가이드를 생성하는 중...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 text-lg">⚠️</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-red-700 mb-1">오류 발생</div>
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && guideData && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">💡</span>
                  <h2 className="text-xl font-bold text-gray-900">창업 가이드</h2>
                </div>

                {/* 제언 요약 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                  <div
                    className="text-base text-gray-800 leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-2 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{
                      __html: guideData?.summary || "요약 내용이 준비 중입니다.",
                    }}
                  />
                </div>

                {/* 상세 리포트 버튼 */}
                <div className="mt-8">
                  <button
                    onClick={() => setIsSolutionModalOpen(true)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📄</span>
                    <span>상세 리포트 보기</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
          >
            ← 이전으로
          </button>
        </div>
      </div>

      <SolutionDetailModal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        solution={guideData?.consulting}
      />
    </div>
  );
};

export default MarketBotGuidePage;
