import { useState, useEffect, useRef, useCallback } from "react";
import { API_SERVER_HOST } from "../../api/memberApi";
import { getCookie } from "../../util/cookieUtil";

/**
 * 트렌드 데이터 SSE 연결을 관리하는 커스텀 훅
 * @param {number} brandId - 브랜드 ID
 * @returns {Object} { trendData, loading, error, connectionStatus, connectionCount }
 */
export const useTrendSse = (brandId) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected, connecting, connected, reconnecting
  const [connectionCount, setConnectionCount] = useState(0);
  const eventSourceRef = useRef(null);
  const isInitialDataReceivedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY_BASE = 3000; // 3초

  // 데이터 파싱 헬퍼 함수
  const parseEventData = useCallback((event) => {
    if (!event || !event.data) {
      return null;
    }
    try {
      return JSON.parse(event.data);
    } catch (parseError) {
      console.error("[SSE] 데이터 파싱 실패:", parseError);
      return null;
    }
  }, []);

  // SSE 연결 생성 함수
  const createConnection = useCallback(() => {
    if (!brandId) return null;

    // 기존 연결이 있으면 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // 초기 데이터 수신 플래그 리셋
    isInitialDataReceivedRef.current = false;
    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    // JWT 토큰 가져오기 (쿠키에서)
    const memberInfo = getCookie("member");
    let sseUrl = `${API_SERVER_HOST}/api/dashboard/trends/stream?brandId=${brandId}`;
    
    // JWT 토큰이 있으면 쿼리 파라미터로 추가
    if (memberInfo && memberInfo.accessToken) {
      sseUrl += `&token=${encodeURIComponent(memberInfo.accessToken)}`;
    }

    // SSE 연결 생성
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // 이벤트 핸들러 정의
    const eventHandlers = {
      "connected": () => {
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // 재연결 성공 시 카운터 리셋
        console.log("[SSE] 연결 완료");
      },
      "connection-count": (event) => {
        const data = parseEventData(event);
        if (data?.connectionCount !== undefined) {
          setConnectionCount(data.connectionCount);
          console.log(`[SSE] 연결된 유저 수: ${data.connectionCount}명`);
        }
      },
      "initial-data": (event) => {
        const data = parseEventData(event);
        if (data) {
          setTrendData(data);
          isInitialDataReceivedRef.current = true;
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      "trend-update": (event) => {
        const data = parseEventData(event);
        if (data) {
          setTrendData(data);
          
          // 초기 데이터 이후 업데이트 시에만 로그 출력
          if (isInitialDataReceivedRef.current) {
            console.log("관련검색어 순위를 업데이트 합니다.");
          } else {
            // 초기 데이터로 처리
            isInitialDataReceivedRef.current = true;
            setLoading(false);
          }
        }
      },
      "error": (event) => {
        const errorData = parseEventData(event);
        if (errorData?.error) {
          console.error("[SSE] 서버 에러:", errorData.error);
          setError(errorData.error);
          setLoading(false);
          setConnectionStatus("disconnected");
        }
      },
    };

    // 이벤트 리스너 등록
    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
      eventSource.addEventListener(eventName, handler);
    });

    // 연결 에러 처리
    eventSource.onerror = () => {
      // 연결이 완전히 끊어진 경우
      if (eventSource.readyState === EventSource.CLOSED) {
        setLoading(false);
        setConnectionStatus("disconnected");
        
        // 재연결 시도 (지수 백오프)
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          const delay = RECONNECT_DELAY_BASE * reconnectAttemptsRef.current;
          setConnectionStatus("reconnecting");
          
          setTimeout(() => {
            if (brandId) {
              createConnection();
            }
          }, delay);
        } else {
          setError("SSE 연결 실패: 최대 재시도 횟수 초과");
          console.error("[SSE] 최대 재연결 시도 횟수 초과");
          setConnectionStatus("disconnected");
        }
      }
    };

    return eventSource;
  }, [brandId, parseEventData]);

  useEffect(() => {
    const eventSource = createConnection();

    // cleanup: 컴포넌트 언마운트 또는 brandId 변경 시 SSE 연결 정리
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setConnectionStatus("disconnected");
      }
      reconnectAttemptsRef.current = 0; // 재연결 카운터 리셋
    };
  }, [createConnection]);

  return { 
    trendData, 
    loading, 
    error, 
    connectionStatus, 
    connectionCount 
  };
};

