import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

/**
 * 무한 스크롤을 적용/비적용할 수 있는 공통 래퍼 컴포넌트
 * 
 * @param {boolean} enabled - 무한 스크롤 활성화 여부
 * @param {Array} data - 전체 데이터 배열
 * @param {number} initialCount - 초기 표시 개수
 * @param {number} loadMoreCount - 추가 로드 개수
 * @param {string} scrollableTarget - 스크롤 가능한 컨테이너 ID
 * @param {Function} children - 렌더링할 컨텐츠 함수 (displayedData를 인자로 받음)
 * @param {React.ReactNode} loader - 로딩 표시 컴포넌트 (선택사항)
 * @param {React.ReactNode} endMessage - 끝 메시지 컴포넌트 (선택사항)
 * @param {boolean} enableLayoutStabilization - 레이아웃 안정화 활성화 여부 (선택사항)
 */
const InfiniteScrollWrapper = ({
  enabled = false,
  data = [],
  initialCount = 20,
  loadMoreCount = 20,
  scrollableTarget,
  children,
  loader = null,
  endMessage = null,
  enableLayoutStabilization = true,
}) => {
  const [displayCount, setDisplayCount] = useState(
    enabled ? Math.min(initialCount, data.length) : data.length
  );

  // enabled나 data가 변경되면 displayCount 리셋
  useEffect(() => {
    setDisplayCount(
      enabled ? Math.min(initialCount, data.length) : data.length
    );
  }, [enabled, data.length, initialCount]);

  const displayedData = data.slice(0, displayCount);
  const hasMore = displayCount < data.length;

  const fetchMoreData = () => {
    // [레이아웃 안정화] enableLayoutStabilization에 따라 requestAnimationFrame 사용 여부 결정
    if (enableLayoutStabilization) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setDisplayCount((prev) => Math.min(prev + loadMoreCount, data.length));
        }, 100); // 딜레이 단축으로 반응성 개선
      });
    } else {
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + loadMoreCount, data.length));
      }, 500);
    }
  };

  // 기본 로더
  const defaultLoader = (
    <div className="text-center py-4">
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p className="text-[10px] text-gray-500 mt-2">로딩 중...</p>
    </div>
  );

  // 기본 엔드 메시지
  const defaultEndMessage = (
    <div className="text-center py-4">
      <p className="text-[10px] text-gray-500">모든 데이터를 불러왔습니다.</p>
    </div>
  );

  // 무한 스크롤이 비활성화되어 있으면 전체 데이터로 children 렌더링
  if (!enabled) {
    return <>{children(data)}</>;
  }

  // 무한 스크롤 활성화 시 InfiniteScroll로 감싸기
  return (
    <InfiniteScroll
      dataLength={displayedData.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={loader || defaultLoader}
      endMessage={endMessage || defaultEndMessage}
      scrollableTarget={scrollableTarget}
    >
      {children(displayedData)}
    </InfiniteScroll>
  );
};

export default InfiniteScrollWrapper;

