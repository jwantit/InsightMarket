package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordTokenSentimentStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsKeywordTokenSentimentStatsRepository extends JpaRepository<AnalyticsKeywordTokenSentimentStats, Long> {

    @Query(value = "SELECT s.token as text, SUM(s.token_count) as value, s.sentiment as polarity " +
            "FROM analytics_keyword_token_sentiment_stats s " +
            "WHERE s.brand_id = :brandId " +
            "AND s.stat_date BETWEEN :startDate AND :endDate " +
            "AND s.analysis_target_type = 'BRAND' " +
            "AND s.source IN :sources " +
            "AND s.competitor_id IS NULL " +
            "AND s.project_id IS NULL " +
            "AND s.keyword_id IS NULL " +
            "GROUP BY s.token, s.sentiment " +
            "ORDER BY SUM(s.token_count) DESC " + // ← 여기 DESC 뒤에 한 칸 띄움!
            "LIMIT 20", // ← 여기 앞에 한 칸 띄움!
            nativeQuery = true) // ← 쉼표 찍고 nativeQuery 설정
    List<Object[]> findWordCloudData(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources
    );
}

