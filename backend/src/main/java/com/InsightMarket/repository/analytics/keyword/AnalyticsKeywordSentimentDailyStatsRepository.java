package com.InsightMarket.repository.analytics.keyword;

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

    @Query("SELECT s FROM AnalyticsKeywordSentimentDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND (:projectId IS NULL OR s.projectId = :projectId) " +
            "AND (:keywordId IS NULL OR s.keywordId = :keywordId) " +
            "AND (:source IS NULL OR s.source = :source) " +
            "AND (:startDate IS NULL OR s.statDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.statDate <= :endDate) " +
            "ORDER BY s.statDate ASC")
    List<AnalyticsKeywordSentimentDailyStats> findByFilters(
            @Param("brandId") Long brandId,
            @Param("projectId") Long projectId,
            @Param("keywordId") Long keywordId,
            @Param("source") String source,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

