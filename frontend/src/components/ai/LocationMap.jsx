import React, { useState, useEffect, useRef } from "react";
import { Search, Navigation, MapPin } from "lucide-react";

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
    placesRef.current.keywordSearch(searchQuery, (data, status) => {
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

        console.log(
          "[LocationMap] 검색 결과:",
          place.place_name,
          place.address_name
        );
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        setError("검색 결과가 없습니다.");
      } else {
        setError("검색 중 오류가 발생했습니다.");
      }
    });
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
    <div className="w-full h-full relative group">
      {/* 플로팅 검색바 */}
      <div className="absolute bottom-8 left-4 right-4 z-10 md:left-auto md:right-8 md:w-80">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 flex items-center gap-2 group-focus-within:border-blue-500 transition-all">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="장소 또는 주소 검색"
            className="flex-1 px-3 py-2 text-sm font-bold text-slate-700 outline-none bg-transparent"
          />
          <button
            onClick={handleSearch}
            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-90"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* 현재 위치 버튼 */}
      <button
        onClick={handleCurrentLocation}
        className="absolute top-32 right-6 z-10 w-12 h-12 bg-white border border-slate-200 rounded-2xl shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:shadow-blue-100 transition-all active:scale-95"
      >
        <Navigation size={20} fill="currentColor" />
      </button>

      <div ref={mapRef} className="w-full h-full rounded-[2rem]" />
    </div>
  );
};

export default LocationMap;
