import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBrand } from "../../hooks/useBrand";
import PlaceComparison from "../../components/ai/PlaceComparison";
import PlaceDetailModal from "../../components/ai/PlaceDetailModal";

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

// 공통 시스템 메시지 컴포넌트
const SystemMessage = ({ children }) => (
  <div className="px-6 py-6">
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="text-sm font-semibold text-blue-900 mb-2">[시스템]</div>
      <div className="text-sm text-blue-800 leading-relaxed">{children}</div>
    </div>
  </div>
);

const MarketBotResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { brandId } = useBrand();

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState(null);

  // location.state에서 데이터 가져오기 (뒤로가기 시에도 유지)
  const resultData = location.state?.resultData;

  // 데이터가 없으면 이전 페이지로 이동
  useEffect(() => {
    if (!resultData) {
      navigate(`/app/${brandId}/ai/marketbot`, { replace: true });
    }
  }, [resultData, navigate, brandId]);

  if (!resultData) {
    return null;
  }

  const { redis, foundCount, bestPlaceId, worstPlaceId, places } = resultData;

  const handleBack = () => {
    navigate(`/app/${brandId}/ai/marketbot`);
  };

  const handleDetailClick = (placeId, placeName) => {
    setSelectedPlaceId(placeId);
    setSelectedPlaceName(placeName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlaceId(null);
    setSelectedPlaceName(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MarketBotHeader>
          <SystemMessage>
            분석 결과, 반경 {redis}m 내 {foundCount}개의 매장이 발견되었습니다.
          </SystemMessage>
        </MarketBotHeader>

        {/* 매장 비교 결과 */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">매장 비교 결과</h2>
            <PlaceComparison
              places={places}
              bestPlaceId={bestPlaceId}
              worstPlaceId={worstPlaceId}
              onDetailClick={handleDetailClick}
            />
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
          >
            ← 다시 분석하기
          </button>
          <button
            onClick={() => {
              navigate(`/app/${brandId}/ai/marketbot/guide`, {
                state: { resultData },
              });
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow"
          >
            창업 가이드 제공 받기
          </button>
        </div>
      </div>

      {/* 상세 데이터 모달 */}
      <PlaceDetailModal
        isOpen={isModalOpen}
        placeId={selectedPlaceId}
        placeName={selectedPlaceName}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default MarketBotResultPage;

