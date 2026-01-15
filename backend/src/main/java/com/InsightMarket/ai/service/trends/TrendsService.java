package com.InsightMarket.ai.service.trends;

// 외부 Python 수집 엔진과의 통신 및 데이터 처리를 담당하는 서비스 인터페이스
public interface TrendsService {
    /**
     * @param brandId 브랜드 ID
     * @param keyword 검색할 브랜드명 (키워드)
     */
    void fetchAndSaveTrends(Long brandId, String keyword);
}

