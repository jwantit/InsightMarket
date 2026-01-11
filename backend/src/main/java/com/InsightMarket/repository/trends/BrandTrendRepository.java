package com.InsightMarket.repository.trends;

import com.InsightMarket.domain.trends.BrandTrend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandTrendRepository extends JpaRepository<BrandTrend, Long> {

    /**
     * 브랜드별 가장 최근 트렌드 데이터 조회
     * @param brandId 브랜드 ID
     * @return 가장 최근 BrandTrend (없을 경우 Optional.empty())
     */
    Optional<BrandTrend> findTopByBrandIdOrderByCollectedAtDesc(Long brandId);
}

