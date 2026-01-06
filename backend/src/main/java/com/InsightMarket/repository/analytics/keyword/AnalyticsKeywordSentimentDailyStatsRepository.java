package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.dashboard.dto.BrandSentimentChartDataDTO;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordSentimentDailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsKeywordSentimentDailyStatsRepository extends JpaRepository<AnalyticsKeywordSentimentDailyStats, Long> {

    @Query("SELECT s FROM AnalyticsKeywordSentimentDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND s.statDate BETWEEN :startDate AND :endDate " +
            "AND s.analysisTargetType = 'BRAND' " +
            "AND s.source IN :sources " +
            "AND s.competitorId IS NULL " +
            "AND s.projectId IS NULL " +
            "AND s.keywordId IS NULL " +
            "ORDER BY s.statDate ASC")
    List<AnalyticsKeywordSentimentDailyStats> findAllByBrandIdAndDateBetween(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources
    );


}

