package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordDailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsKeywordDailyStatsRepository extends JpaRepository<AnalyticsKeywordDailyStats, Long> {

    @Query("SELECT s FROM AnalyticsKeywordDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND s.statDate BETWEEN :startDate AND :endDate " +
            "AND s.analysisTargetType = 'BRAND' " +
            "AND s.source IN :sources " +
            "AND s.competitorId IS NULL " +
            "AND s.projectId IS NULL " +
            "AND s.keywordId IS NULL " +
            "ORDER BY s.statDate ASC")
    List<AnalyticsKeywordDailyStats> findStatsForDashboard(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources
    );
}

