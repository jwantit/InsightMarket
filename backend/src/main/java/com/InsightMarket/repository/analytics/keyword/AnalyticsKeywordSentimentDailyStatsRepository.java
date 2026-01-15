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

            // 1. 프로젝트 ID: null이면 DB도 NULL인 것만, 값이 있으면 해당 ID만
            "AND (:projectId IS NULL AND s.projectId IS NULL OR s.projectId = :projectId) " +

            // 2. 키워드 ID: null이면 DB도 NULL인 것만, 값이 있으면 해당 ID만
            "AND (:keywordId IS NULL AND s.keywordId IS NULL OR s.keywordId = :keywordId) " +

            // 3. 경쟁사 ID: null이면 DB도 NULL인 것만, 값이 있으면 해당 ID만
            "AND (:competitorId IS NULL AND s.competitorId IS NULL OR s.competitorId = :competitorId) " +

            // 4. 소스 및 기간 필터
            "AND (:source IS NULL OR s.source = :source) " +
            "AND (:startDate IS NULL OR s.statDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.statDate <= :endDate) " +
            "ORDER BY s.statDate ASC")
    List<AnalyticsKeywordSentimentDailyStats> findByFilters(
            @Param("brandId") Long brandId,
            @Param("projectId") Long projectId,
            @Param("keywordId") Long keywordId,
            @Param("competitorId") Long competitorId,
            @Param("source") String source,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

