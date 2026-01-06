package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordInsightResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AnalyticsKeywordInsightResultRepository extends JpaRepository<AnalyticsKeywordInsightResult, Long> {

    //인사이트 텍스트 가져오기
    @Query("SELECT a FROM AnalyticsKeywordInsightResult a " +
            "WHERE a.brandId = :brandId " +
            "AND a.analysisTargetType = 'BRAND' " +
            "AND a.competitorId IS NULL " +
            "AND a.keywordId IS NULL " +
            "AND a.projectId IS NULL " +
            "ORDER BY a.statDate DESC, a.insightId DESC LIMIT 1")
    Optional<AnalyticsKeywordInsightResult> findBrandInsights(@Param("brandId") Long brandId);
}

