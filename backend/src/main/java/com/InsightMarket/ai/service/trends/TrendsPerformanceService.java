package com.InsightMarket.ai.service.trends;

/**
 * DB 조회와 Redis 조회의 성능을 비교하는 서비스 인터페이스
 */
public interface TrendsPerformanceService {

    /**
     * DB 조회와 Redis 조회의 성능을 비교하여 결과를 로그/콘솔에 출력
     * @param brandId 브랜드 ID
     */
    void comparePerformance(Long brandId);
}

