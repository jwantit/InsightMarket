package com.InsightMarket.ai.service.trends;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;

/**
 * 트렌드 데이터를 DB에 저장/조회하는 서비스 인터페이스
 */
public interface TrendsDbService {

    /**
     * 브랜드별 트렌드 데이터를 DB에 저장
     * @param brandId 브랜드 ID
     * @param data 트렌드 데이터
     */
    void saveTrendData(Long brandId, PythonTrendResponseDTO data);

    /**
     * DB에서 브랜드별 트렌드 데이터 조회
     * @param brandId 브랜드 ID
     * @return 캐싱된 트렌드 데이터 (없을 경우 null)
     */
    PythonTrendResponseDTO getTrendData(Long brandId);
}

