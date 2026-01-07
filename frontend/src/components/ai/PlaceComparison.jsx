import React from "react";

const PlaceComparison = ({ places, bestPlaceId, worstPlaceId, onDetailClick }) => {
  // Best와 Worst 매장만 필터링
  const bestPlace = places.find((p) => p.placeId === bestPlaceId);
  const worstPlace = places.find((p) => p.placeId === worstPlaceId);

  if (!bestPlace && !worstPlace) {
    return (
      <div className="text-center py-8 text-gray-500">
        비교할 매장 데이터가 없습니다.
      </div>
    );
  }

  const PlaceCard = ({ place }) => {
    if (!place) return null;

    const isBest = place.rank === "Best";

    return (
      <div
        className={`rounded-xl border-2 p-6 h-full ${
          isBest ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBest ? <span className="text-2xl">🏆</span> : <span className="text-2xl">📉</span>}
            <h3 className="text-lg font-bold text-gray-900">{place.placeName}</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isBest ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {isBest ? "BEST" : "WORST"}
          </span>
        </div>

        <div className="border-t border-gray-300 my-4"></div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">매출지수:</span>
            <span
              className={`text-2xl font-bold ${isBest ? "text-green-700" : "text-red-700"}`}
            >
              {place.salesIndex}
            </span>
          </div>
          <div className="text-sm text-gray-600">({place.desc})</div>
        </div>

        <button
          className="mt-6 w-full py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all"
          onClick={() => {
            if (onDetailClick) {
              onDetailClick(place.placeId, place.placeName);
            }
          }}
        >
          상세 데이터 보기
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PlaceCard place={bestPlace} />
      <PlaceCard place={worstPlace} />
    </div>
  );
};

export default PlaceComparison;

