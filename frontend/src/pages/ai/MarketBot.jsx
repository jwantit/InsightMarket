import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrand } from "../../hooks/useBrand";
import CategorySelector, {
  getCategoryGroupName,
  getCategoryLabel,
} from "../../components/ai/CategorySelector";
import LocationMap from "../../components/ai/LocationMap";
import AnalysisLoadingModal from "../../components/ai/AnalysisLoadingModal";
// import { requestMarketBot } from "../../api/marketBotApi"; // TODO: API 연결 시 주석 해제
import { getMockAnalysisResult, getErrorMessage } from "../../api/marketBotApi";

const MarketBot = () => {
  const navigate = useNavigate();
  const { brandId } = useBrand();

  // 상태 관리
  const [category, setCategory] = useState("cafe");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [radius, setRadius] = useState(300);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 위치 변경 핸들러
  const handleLocationChange = ({ latitude, longitude }) => {
    setLocation({ latitude, longitude });
  };

  // 주소 변경 핸들러
  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  // 분석 시작
  const handleAnalyze = async () => {
    // 유효성 검사 (단순 검증)
    if (!location.latitude || !location.longitude) {
      setError("위치를 선택해주세요.");
      return;
    }
    if (!address) {
      setError("주소 정보를 가져올 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 선택된 카테고리의 그룹명 가져오기
      const categoryGroupName = getCategoryGroupName(category);

      const params = {
        x: location.longitude.toString(), // 경도 (카카오 형식)
        y: location.latitude.toString(), // 위도 (카카오 형식)
        redis: radius,
        address,
        category_group_name: categoryGroupName,
      };

      console.log("[MarketBot] 분석 요청:", params);

      // TODO: API 연결 시 주석 해제하고 아래 임시 코드 제거
      // const result = await requestMarketBot(params);
      // console.log("[MarketBot] 분석 결과:", result);
      // 
      // // 결과 페이지로 이동 (location.state로 데이터 전달)
      // navigate(`/app/${brandId}/ai/marketbot/result`, {
      //   state: { resultData: result },
      // });

      // 임시: API 연결 전까지 모의 데이터 사용
      setTimeout(() => {
        setLoading(false);
        const mockResult = getMockAnalysisResult(radius);
        navigate(`/app/${brandId}/ai/marketbot/result`, {
          state: { resultData: mockResult },
        });
      }, 10000); // 모달 애니메이션을 보기 위해 10초로 설정
    } catch (err) {
      console.error("[MarketBot] 분석 오류:", err);
      setError(getErrorMessage(err, "분석 중 오류가 발생했습니다."));
      setLoading(false);
    }
  };

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

  // 공통 에러 메시지 컴포넌트
  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-lg">⚠️</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-700 mb-1">오류 발생</div>
            <div className="text-sm text-red-700">{message}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MarketBotHeader>
          <SystemMessage>
            안녕하세요! 주변 {getCategoryLabel(category)} 매출 분석을 기반으로 창업 가이드를 제공해 드립니다.
            <br />
            <br />
            현재 계신 위치를 공유해주세요.
          </SystemMessage>
        </MarketBotHeader>

        {/* 입력 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6">
          <div className="p-6 space-y-6">
            {/* 카테고리 선택 컴포넌트 */}
            <CategorySelector category={category} onCategoryChange={setCategory} />

            {/* 지도 컴포넌트 */}
            <LocationMap
              onLocationChange={handleLocationChange}
              onAddressChange={handleAddressChange}
            />

            {/* 반경 선택 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                분석 반경 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-semibold">
                  {radius}m
                </div>
              </div>
            </div>

            {/* 선택된 위치 정보 */}
            {(location.latitude && location.longitude) && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-600 mb-2">선택된 위치</div>
                <div className="text-sm text-gray-800">
                  {address || "주소 검색 중..."}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  위도: {location.latitude.toFixed(6)}, 경도: {location.longitude.toFixed(6)}
                </div>
              </div>
            )}

            {/* 분석 시작 버튼 */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !location.latitude || !location.longitude}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                loading || !location.latitude || !location.longitude
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
              }`}
            >
              {loading ? "분석 중..." : "📍 위치 정보 보내기"}
            </button>
          </div>
        </div>

        <ErrorMessage message={error} />
      </div>

      {/* 분석 중 로딩 모달 */}
      <AnalysisLoadingModal isOpen={loading} radius={radius} />
    </div>
  );
};

export default MarketBot;
