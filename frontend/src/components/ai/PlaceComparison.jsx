// src/components/ai/PlaceComparison.jsx
import React from "react";
import { Trophy, TrendingDown, ArrowUpRight, BarChart3 } from "lucide-react";

const PlaceComparison = ({
  places,
  bestPlaceId,
  worstPlaceId,
  onDetailClick,
}) => {
  const bestPlace = places.find((p) => p.placeId === bestPlaceId);
  const worstPlace = places.find((p) => p.placeId === worstPlaceId);

  const ComparisonCard = ({ place, type }) => {
    const isBest = type === "best";
    return (
      <div
        className={`relative overflow-hidden rounded-[2.5rem] p-8 border transition-all hover:shadow-2xl ${
          isBest
            ? "bg-emerald-50 border-emerald-100 shadow-emerald-100/50"
            : "bg-rose-50 border-rose-100 shadow-rose-100/50"
        }`}
      >
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-8">
            <div
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                isBest
                  ? "bg-emerald-500 text-white border-emerald-400"
                  : "bg-rose-500 text-white border-rose-400"
              }`}
            >
              {isBest ? "Market Leader" : "Needs Attention"}
            </div>
            {isBest ? (
              <Trophy className="text-emerald-500" size={32} />
            ) : (
              <TrendingDown className="text-rose-500" size={32} />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {place.placeName}
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {place.desc}
            </p>
          </div>

          <div className="mt-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Sales Index
              </p>
              <p
                className={`text-5xl font-black tracking-tighter ${
                  isBest ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {place.salesIndex}
              </p>
            </div>
            <button
              onClick={() => onDetailClick(place.placeId, place.placeName)}
              className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs shadow-lg shadow-slate-200 border border-slate-100 flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
            >
              <BarChart3 size={14} /> 상세 데이터
            </button>
          </div>
        </div>
        {/* 배경 장식 원 */}
        <div
          className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${
            isBest ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
      {bestPlace && <ComparisonCard place={bestPlace} type="best" />}
      {worstPlace && <ComparisonCard place={worstPlace} type="worst" />}
    </div>
  );
};

export default PlaceComparison;
