// src/components/ai/PlaceDetailModal.jsx
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
import { X, Activity, Users, AlertTriangle, TrendingUp } from "lucide-react";

const PlaceDetailModal = ({ isOpen, placeId, placeName, onClose }) => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && placeId) fetchPlaceDetail();
    else {
      setDetailData(null);
      setError(null);
    }
  }, [isOpen, placeId]);

  const fetchPlaceDetail = async () => {
    setLoading(true);
    try {
      const data = await getPlaceDetail(placeId);
      setDetailData(data);
    } catch (err) {
      setError(getErrorMessage(err, "상세 데이터를 불러올 수 없습니다."));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
        {/* 헤더 */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                상권 정밀 분석 리포트
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Deep Market Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-8 py-8 overflow-y-auto flex-1 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-500">
                데이터 엔진 가동 중...
              </p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600">
              <AlertTriangle size={24} />
              <p className="font-bold">{error}</p>
            </div>
          ) : (
            detailData && (
              <>
                {/* 기본 요약 카드 */}
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                      {detailData.placeName}
                    </h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                      Place ID: {placeId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricBox
                      icon={TrendingUp}
                      label="유동인구 피크"
                      value={`${detailData.trafficPeak.start} ~ ${detailData.trafficPeak.end}`}
                      color="blue"
                    />
                    <MetricBox
                      icon={Users}
                      label="주요 연령층"
                      value={`${detailData.mainAgeGroup.label} (${Math.round(
                        detailData.mainAgeGroup.ratio * 100
                      )}%)`}
                      color="indigo"
                    />
                    <MetricBox
                      icon={AlertTriangle}
                      label="업종 과포화도"
                      value={detailData.saturation.label}
                      color="rose"
                      isBadge={true}
                      level={detailData.saturation.level}
                    />
                  </div>
                </div>

                {/* 차트 영역 */}
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 shadow-inner">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-blue-500" /> 시간대별
                    유동인구 추이
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={detailData.trafficSeries}>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          vertical={false}
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#94a3b8",
                          }}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                            fontWeight: "bold",
                          }}
                          formatter={(v) => [
                            `${v.toLocaleString()}명`,
                            "유동인구",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          dot={{
                            r: 5,
                            fill: "#3b82f6",
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// 내부 보조 컴포넌트
const MetricBox = ({ icon: Icon, label, value, color, isBadge, level }) => (
  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-2">
    <div className={`p-2 w-fit rounded-lg bg-${color}-50 text-${color}-600`}>
      <Icon size={16} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
      {label}
    </p>
    {isBadge ? (
      <p
        className={`text-sm font-black px-2 py-0.5 rounded-md w-fit bg-rose-50 text-rose-600 border border-rose-100`}
      >
        {value}
      </p>
    ) : (
      <p className="text-sm font-black text-slate-900 tracking-tight">
        {value}
      </p>
    )}
  </div>
);

export default PlaceDetailModal;
