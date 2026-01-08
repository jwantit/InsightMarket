import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getPlaceDetail,
  getSaturationColor,
  getErrorMessage,
} from "../../api/marketBotApi";

const PlaceDetailModal = ({ isOpen, placeId, placeName, onClose }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && placeId) {
      fetchPlaceDetail();
    } else {
      // 모달이 닫히면 데이터 초기화
      setDetailData(null);
      setError(null);
    }
  }, [isOpen, placeId]);

  const fetchPlaceDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      // API 호출
      const data = await getPlaceDetail(placeId);
      console.log("[PlaceDetailModal] 상세 데이터 응답:", data);
      setDetailData(data);
      setLoading(false);
    } catch (err) {
      console.error("[PlaceDetailModal] 상세 데이터 조회 오류:", err);
      setError(getErrorMessage(err, "상세 데이터를 불러올 수 없습니다."));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              상권 분석 봇 (Beta)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">
                  데이터를 불러오는 중...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-700 mb-1">
                    오류 발생
                  </div>
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {detailData && !loading && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📊 상권 정밀 분석
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {detailData.placeName}
                </p>

                <div className="space-y-3">
                  {/* 유동인구 피크 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      1. 유동인구 피크:
                    </span>
                    <span className="text-sm text-gray-800">
                      {detailData.trafficPeak.start} ~{" "}
                      {detailData.trafficPeak.end}
                    </span>
                  </div>

                  {/* 주요 연령층 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      2. 주요 연령층:
                    </span>
                    <span className="text-sm text-gray-800">
                      {detailData.mainAgeGroup.label} (
                      {Math.round(detailData.mainAgeGroup.ratio * 100)}%)
                    </span>
                  </div>

                  {/* 업종 과포화도 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                      3. 업종 과포화도:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${getSaturationColor(
                        detailData.saturation.level
                      )}`}
                    >
                      {detailData.saturation.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* 유동인구 그래프 */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-700 mb-4">
                  유동인구 그래프
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={detailData.trafficSeries}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: "white",
                        }}
                        formatter={(value) => [`${value}명`, "유동인구"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          fill: "#3b82f6",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
