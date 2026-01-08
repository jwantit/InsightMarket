// src/pages/ai/MarketAnalysisPage.jsx
import React, { useState } from "react";
import { useBrand } from "../../hooks/useBrand";
import {
  MapPin,
  Sparkles,
  Navigation,
  Info,
  Target,
  Radio,
  Map,
  ArrowRight,
  RefreshCcw,
  Lightbulb,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import CategorySelector, {
  getCategoryGroupName,
} from "../../components/ai/CategorySelector";
import LocationMap from "../../components/ai/LocationMap";
import AnalysisLoadingModal from "../../components/ai/AnalysisLoadingModal";
import PlaceComparison from "../../components/ai/PlaceComparison";
import PlaceDetailModal from "../../components/ai/PlaceDetailModal";
import SolutionDetailModal from "../../components/ai/SolutionDetailModal";
import PageHeader from "../../components/common/PageHeader";
import {
  requestMarketBot,
  requestMarketBotGuide,
  getErrorMessage,
} from "../../api/marketBotApi";

const MarketAnalysisPage = () => {
  const { brandId } = useBrand();

  // 상태 관리: INPUT → LOADING → RESULT → GUIDE
  const [status, setStatus] = useState("INPUT"); // INPUT | LOADING | RESULT | GUIDE

  // 입력 상태
  const [category, setCategory] = useState("cafe");
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [radius, setRadius] = useState(300);
  const [address, setAddress] = useState("");

  // 결과 데이터
  const [resultData, setResultData] = useState(null);
  const [guideData, setGuideData] = useState(null);

  // 에러 및 로딩
  const [error, setError] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState(null);

  // 모달 상태
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [selectedPlaceName, setSelectedPlaceName] = useState(null);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);

  // 분석 시작
  const handleAnalyze = async () => {
    if (!location.latitude || !location.longitude) {
      setError("위치를 선택해주세요.");
      return;
    }

    setStatus("LOADING");
    setError(null);

    try {
      // 최소 8초 지연 + API 호출을 동시에 실행
      const [result] = await Promise.all([
        requestMarketBot({
          category: getCategoryGroupName(category),
          latitude: location.latitude,
          longitude: location.longitude,
          radius,
          address,
        }),
        new Promise((resolve) => setTimeout(resolve, 8000)), // 최소 8초 대기
      ]);

      setResultData(result);
      setStatus("RESULT");
    } catch (err) {
      setError(getErrorMessage(err, "분석 중 오류가 발생했습니다."));
      setStatus("INPUT");
    }
  };

  // 가이드 요청
  const handleRequestGuide = async () => {
    if (!resultData) return;

    setStatus("GUIDE");
    setGuideLoading(true);
    setGuideError(null);

    try {
      const data = await requestMarketBotGuide(resultData);
      setGuideData(data);
    } catch (err) {
      setGuideError(getErrorMessage(err, "창업 가이드를 불러올 수 없습니다."));
    } finally {
      setGuideLoading(false);
    }
  };

  // 다시 분석하기
  const handleReset = () => {
    setStatus("INPUT");
    setResultData(null);
    setGuideData(null);
    setError(null);
    setGuideError(null);
  };

  // 뒤로가기 (RESULT로)
  const handleBackToResult = () => {
    setStatus("RESULT");
  };

  // Place 상세 모달
  const handlePlaceDetailClick = (id, name) => {
    setSelectedPlaceId(id);
    setSelectedPlaceName(name);
    setIsPlaceModalOpen(true);
  };

  if (!resultData && status === "RESULT") {
    setStatus("INPUT");
  }

  const radiusValue = resultData?.radius || resultData?.redis || radius;
  const { foundCount, bestPlaceId, worstPlaceId, places } = resultData || {};

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 고정 헤더 */}
      <PageHeader
        icon={Navigation}
        isAi={true}
        title="상권 분석"
        breadcrumb="AI Marketing / Geo-Analysis"
        subtitle={
          status === "INPUT"
            ? "위치 기반 매출 데이터를 분석하여 최적의 창업 전략과 상권 인사이트를 도출합니다."
            : status === "RESULT"
            ? `${radiusValue}m 반경 내 수집된 ${foundCount}개의 매장 데이터를 비교 분석했습니다.`
            : "데이터 분석을 바탕으로 도출된 전략적 창업 제언 리포트입니다."
        }
      />

      {/* Step 1: INPUT - 입력 폼 */}
      {status === "INPUT" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 설정 패널 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 카테고리 선택 카드 */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <Target size={14} className="text-blue-600" />
                  업종 선택
                </div>
                <CategorySelector
                  category={category}
                  onCategoryChange={setCategory}
                />
              </div>

              {/* 반경 설정 카드 */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <Radio size={14} className="text-blue-600" />
                  상권 분석 범위
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        최소
                      </span>
                      <span className="text-2xl font-black text-blue-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">
                        {radius}m
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        최대
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((radius - 100) / 900) * 100
                        }%, #e2e8f0 ${
                          ((radius - 100) / 900) * 100
                        }%, #e2e8f0 100%)`,
                      }}
                    />
                    <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-400">
                      <span>100m</span>
                      <span>1km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 분석 버튼 */}
              <button
                onClick={handleAnalyze}
                disabled={!location.latitude}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-95"
              >
                <Sparkles
                  size={20}
                  className="group-hover:rotate-12 transition-transform"
                />
                분석 리포트 요청
              </button>

              {/* 선택된 위치 정보 */}
              {location.latitude && (
                <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2rem] p-6 text-white shadow-2xl animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                      <MapPin size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                      선택된 위치
                    </span>
                  </div>
                  <p className="text-base font-bold leading-tight mb-2">
                    {address}
                  </p>
                  <p className="text-[10px] opacity-70 font-mono">
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* 오른쪽: 지도 영역 */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 h-[600px] relative overflow-hidden">
              <div className="absolute top-6 left-6 z-10 right-6">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <Info size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-wide">
                      위치 선택 가이드
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      분석을 원하시는{" "}
                      <span className="text-blue-600 font-black">
                        정확한 위치
                      </span>
                      를 지도에서 클릭하거나 검색해 주세요. 해당 지점을 기준으로
                      주변 데이터를 수집합니다.
                    </p>
                  </div>
                </div>
              </div>
              <LocationMap
                onLocationChange={setLocation}
                onAddressChange={setAddress}
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-2xl flex items-center gap-4 text-rose-700 animate-in shake shadow-sm">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                <Info size={20} className="text-rose-600" />
              </div>
              <span className="text-sm font-bold">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 2: LOADING - 분석 중 */}
      {status === "LOADING" && (
        <AnalysisLoadingModal isOpen={true} radius={radius} />
      )}

      {/* Step 3: RESULT - 분석 결과 */}
      {status === "RESULT" && resultData && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* 시스템 요약 바 */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                <Sparkles size={12} /> AI 진단 완료
              </div>
              <h3 className="text-xl font-bold">
                주변 {foundCount}개의 경쟁 매장을 정밀 분석하였습니다.
              </h3>
              <p className="text-slate-400 text-sm">
                가장 성과가 좋은 모델과 개선이 필요한 모델을 대조하여 전략을
                수립하세요.
              </p>
            </div>
            <div className="relative z-10 flex gap-3">
              <div className="text-center px-6 border-r border-white/10">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                  분석 매장 수
                </p>
                <p className="text-3xl font-black text-white">{foundCount}</p>
              </div>
              <div className="text-center px-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                  분석 반경
                </p>
                <p className="text-3xl font-black text-blue-400">{radius}m</p>
              </div>
            </div>
            <Map className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* 매장 비교 섹션 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1 h-8 bg-blue-600 rounded-full" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">
                매장 성과 비교 분석
              </h3>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <PlaceComparison
                places={places}
                bestPlaceId={bestPlaceId}
                worstPlaceId={worstPlaceId}
                onDetailClick={handlePlaceDetailClick}
              />
            </div>
          </section>

          {/* 하단 액션 버튼 */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <RefreshCcw size={18} />
              다시 분석하기
            </button>
            <button
              onClick={handleRequestGuide}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 group"
            >
              창업 가이드 제공 받기
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: GUIDE - AI 창업 가이드 */}
      {status === "GUIDE" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-10 space-y-8">
              {guideLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
                    <Sparkles
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse"
                      size={32}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-black text-slate-900 tracking-tight">
                      가장 유리한 창업 시나리오를 설계 중입니다...
                    </p>
                    <p className="text-sm text-slate-500">
                      AI가 데이터를 분석하여 최적의 전략을 도출하고 있습니다.
                    </p>
                  </div>
                </div>
              ) : guideError ? (
                <div className="bg-rose-50 border-2 border-rose-200 p-8 rounded-[2rem] flex items-start gap-5 text-rose-700">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black mb-1">오류 발생</p>
                    <p className="text-sm font-medium">{guideError}</p>
                  </div>
                </div>
              ) : (
                guideData && (
                  <>
                    {/* 헤더 */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                        <Lightbulb size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                          AI Strategy Summary
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          데이터 기반 창업 전략 제언
                        </p>
                      </div>
                    </div>

                    {/* 제언 요약 하이라이트 박스 */}
                    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl shadow-amber-900/10">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6 text-amber-700">
                          <CheckCircle2 size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Key Recommendations
                          </span>
                        </div>
                        <div
                          className="prose prose-slate max-w-none 
                                      [&_ul]:space-y-3 [&_li]:text-slate-800 [&_li]:font-bold [&_li]:text-base [&_li]:leading-relaxed
                                      [&_p]:text-slate-700 [&_p]:font-medium [&_p]:leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: guideData?.summary,
                          }}
                        />
                      </div>
                      <Sparkles
                        size={160}
                        className="absolute -bottom-12 -right-12 text-amber-200/40 rotate-12"
                      />
                    </div>

                    {/* 상세 리포트 호출 버튼 */}
                    <div className="pt-6">
                      <button
                        onClick={() => setIsSolutionModalOpen(true)}
                        className="w-full py-6 bg-gradient-to-r from-slate-900 to-blue-900 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-lg rounded-[1.5rem] transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 active:scale-[0.98] group"
                      >
                        <FileText
                          size={24}
                          className="group-hover:rotate-6 transition-transform"
                        />
                        상세 컨설팅 리포트 전체 보기
                      </button>
                    </div>
                  </>
                )
              )}
            </div>
          </div>

          {/* 뒤로가기 */}
          <div className="flex justify-center">
            <button
              onClick={handleBackToResult}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest bg-slate-50 hover:bg-slate-100 rounded-xl"
            >
              <RefreshCcw size={16} />
              결과로 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* 모달들 */}
      <PlaceDetailModal
        isOpen={isPlaceModalOpen}
        placeId={selectedPlaceId}
        placeName={selectedPlaceName}
        onClose={() => setIsPlaceModalOpen(false)}
      />

      <SolutionDetailModal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        solution={guideData?.consulting}
      />
    </div>
  );
};

export default MarketAnalysisPage;
