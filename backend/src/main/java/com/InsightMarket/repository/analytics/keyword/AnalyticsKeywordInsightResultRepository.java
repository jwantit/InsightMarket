package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordInsightResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
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

    @Query("SELECT i FROM AnalyticsKeywordInsightResult i " +
            "WHERE i.brandId = :brandId " +
            "AND (:projectId IS NULL OR i.projectId = :projectId) " +
            "AND (:keywordId IS NULL OR i.keywordId = :keywordId) " +
            "AND (:source IS NULL OR i.source = :source) " +
            "AND i.statDate = (SELECT MAX(i2.statDate) FROM AnalyticsKeywordInsightResult i2 " +
            "                  WHERE i2.brandId = :brandId " +
            "                  AND (:projectId IS NULL OR i2.projectId = :projectId) " +
            "                  AND (:keywordId IS NULL OR i2.keywordId = :keywordId) " +
            "                  AND (:source IS NULL OR i2.source = :source)) " +
            "ORDER BY i.statDate DESC, i.insightId DESC")
    List<AnalyticsKeywordInsightResult> findLatestInsights(
            @Param("brandId") Long brandId,
            @Param("projectId") Long projectId,
            @Param("keywordId") Long keywordId,
            @Param("source") String source
    );

    @Query("SELECT i FROM AnalyticsKeywordInsightResult i " +
            "WHERE i.brandId = :brandId " +
            "AND (:projectId IS NULL OR i.projectId = :projectId) " +
            "AND (:keywordId IS NULL OR i.keywordId = :keywordId) " +
            "AND (:source IS NULL OR i.source = :source) " +
            "AND (:startDate IS NULL OR i.statDate >= :startDate) " +
            "AND (:endDate IS NULL OR i.statDate <= :endDate) " +
            "ORDER BY i.statDate DESC")
    List<AnalyticsKeywordInsightResult> findByFilters(
            @Param("brandId") Long brandId,
            @Param("projectId") Long projectId,
            @Param("keywordId") Long keywordId,
            @Param("source") String source,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

