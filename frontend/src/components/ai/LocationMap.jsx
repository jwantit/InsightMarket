import React, { useState, useEffect, useRef } from "react";

const LocationMap = ({ onLocationChange, onAddressChange }) => {
  // 카카오 맵 관련
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesRef = useRef(null);

  // 검색 관련
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // 공통: 위치/마커/주소 업데이트
  const updateLocation = ({ lat, lng, map }) => {
    const kakao = window.kakao;
    if (!kakao || !map) return;

    const locPosition = new kakao.maps.LatLng(lat, lng);

    // 지도 중심 이동
    map.setCenter(locPosition);

    // 부모에 위치 전달
    if (onLocationChange) {
      onLocationChange({ latitude: lat, longitude: lng });
    }

    // 마커 업데이트
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new kakao.maps.Marker({ position: locPosition });
    markerRef.current.setMap(map);

    // 주소 검색
    if (geocoderRef.current && onAddressChange) {
      geocoderRef.current.coord2Address(lng, lat, (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const addr = result[0].address;
          onAddressChange(addr.address_name);
        }
      });
    }
  };

  // 카카오 맵 초기화
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao) {
      console.error("카카오 맵 SDK가 로드되지 않았습니다.");
      return;
    }

    kakao.maps.load(() => {
      const container = mapRef.current;
      if (!container) return;

      // 지도 생성
      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울시청 기본 위치
        level: 3,
      });

      mapInstanceRef.current = map;
      geocoderRef.current = new kakao.maps.services.Geocoder();
      placesRef.current = new kakao.maps.services.Places();

      // 현재 위치 받아오기 (기본값 설정)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            updateLocation({ lat, lng: lon, map });
          },
          (err) => {
            console.error("[LocationMap] 현재 위치를 가져올 수 없습니다:", err);
          }
        );
      }

      // 지도 클릭 이벤트 - 클릭한 위치로 마커 이동 및 위치값 업데이트
      kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        console.log("[LocationMap] 지도 클릭 위치:", lat, lng);

        updateLocation({ lat, lng, map });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 장소 검색
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    const kakao = window.kakao;
    if (!kakao || !mapInstanceRef.current || !placesRef.current) {
      setError("지도가 초기화되지 않았습니다.");
      return;
    }

    setIsSearching(true);
    setError(null);

    // 장소 검색
    placesRef.current.keywordSearch(
      searchQuery,
      (data, status) => {
        setIsSearching(false);

        if (status === kakao.maps.services.Status.OK) {
          // 첫 번째 검색 결과 사용
          const place = data[0];
          const lat = parseFloat(place.y);
          const lon = parseFloat(place.x);

          updateLocation({
            lat,
            lng: lon,
            map: mapInstanceRef.current,
          });

          // 주소 우선 설정
          if (place.address_name && onAddressChange) {
            onAddressChange(place.address_name);
          }

          console.log("[LocationMap] 검색 결과:", place.place_name, place.address_name);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          setError("검색 결과가 없습니다.");
        } else {
          setError("검색 중 오류가 발생했습니다.");
        }
      }
    );
  };

  // Enter 키로 검색
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 현재 위치로 이동
  const handleCurrentLocation = () => {
    if (!mapInstanceRef.current) {
      setError("지도가 초기화되지 않았습니다.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          updateLocation({ lat, lng: lon, map: mapInstanceRef.current });
        },
        (err) => {
          setError("위치 정보 접근 권한이 필요합니다.");
          console.error("[LocationMap] 위치 가져오기 실패:", err);
        }
      );
    }
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-3">
        위치 선택 <span className="text-red-500">*</span>
      </label>

      {/* 검색창 - 라벨 아래 */}
      <div className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="장소, 주소 검색"
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all font-semibold text-sm flex items-center gap-2 ${
              isSearching || !searchQuery.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>검색 중</span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>검색</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-96 rounded-xl overflow-hidden border border-gray-200"
        />

        {/* 현재 위치 버튼 - 우측 하단, 지도보다 위로 */}
        <button
          onClick={handleCurrentLocation}
          className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all"
          title="현재 위치로 이동"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="3" fill="#333" stroke="#333" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="8" stroke="#333" strokeWidth="1.5" fill="none" />
            <line x1="12" y1="4" x2="12" y2="6" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="18" x2="12" y2="20" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="12" x2="6" y2="12" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="18" y1="12" x2="20" y2="12" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-2">
        검색창에 장소를 입력하거나, 지도를 클릭하거나 현재 위치 아이콘을 눌러 위치를 선택하세요.
      </p>
    </div>
  );
};

export default LocationMap;

