package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.PythonTrendResponseDTO;

// 구글 트렌드 데이터의 Redis 캐싱을 관리하는 서비스 인터페이스
public interface TrendsRedisService {

    // 브랜드별 트렌드 데이터를 Redis에 저장
    void saveTrendData(Long brandId, PythonTrendResponseDTO data);

    /**
     * Redis에서 브랜드별 트렌드 데이터 조회
     * @param brandId 브랜드 식별자
     * @return 캐싱된 트렌드 데이터 (없을 경우 null)
     */
    PythonTrendResponseDTO getTrendData(Long brandId);
}