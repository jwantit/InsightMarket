package com.InsightMarket.repository.analytics.keyword;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordDailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
            @Param("sources") List<String> sources);

    //가장 언급많은 채널 구하기 ----------------------------------------------
    @Query("SELECT s.source " +
            "FROM AnalyticsKeywordDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND s.statDate BETWEEN :startDate AND :endDate " +
            "AND s.source IN :sources " + // 유튜브, 네이버 등 선택된 소스 필터링
            "AND s.analysisTargetType = 'BRAND' " +
            "AND s.competitorId IS NULL " +
            "AND s.projectId IS NULL " +
            "AND s.keywordId IS NULL " +
            "GROUP BY s.source " + // 1. 소스(NAVER, YOUTUBE)별로 그룹 묶기
            "ORDER BY SUM(s.mentionCount) DESC " + // 2. 그룹별 언급량 합계 기준 내림차순
            "LIMIT 1")
    // 3. 가장 높은 합계를 가진 소스 하나만 추출
    Optional<String> findMentionTopSourceForDashboard(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources);
    //----------------------------------------------

    @Query("SELECT s.statDate " + // 1. 날짜를 가져와야 하므로 필드 변경
            "FROM AnalyticsKeywordDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND s.statDate BETWEEN :startDate AND :endDate " +
            "AND s.source IN :sources " +
            "AND s.analysisTargetType = 'BRAND' " +
            "AND s.competitorId IS NULL " +
            "AND s.projectId IS NULL " +
            "AND s.keywordId IS NULL " +
            "GROUP BY s.statDate " + // 2. 날짜별로 그룹을 묶음
            "ORDER BY SUM(s.mentionCount) DESC " + // 3. 해당 날짜의 언급량 합계 기준 내림차순
            "LIMIT 1")
    Optional<LocalDate> findMentionTopDateDashboard(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources);

    @Query("SELECT SUM(s.mentionCount) " +
            "FROM AnalyticsKeywordDailyStats s " +
            "WHERE s.brandId = :brandId " +
            "AND s.statDate BETWEEN :startDate AND :endDate " +
            "AND s.source IN :sources " +
            "AND s.analysisTargetType = 'BRAND' " +
            "AND s.competitorId IS NULL " +
            "AND s.projectId IS NULL " +
            "AND s.keywordId IS NULL")
    Long sumTotalMentionCount(
            @Param("brandId") Long brandId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("sources") List<String> sources);


    //----------------------------------------------------------------------------------------



    @Query("SELECT s FROM AnalyticsKeywordDailyStats s " +
            "WHERE s.brandId = :brandId " +

            // 1. 경쟁사 ID 필터: 파라미터가 null이면 DB도 NULL인 것(브랜드)만, 값이 있으면 해당 경쟁사만
            "AND (:competitorId IS NULL AND s.competitorId IS NULL OR s.competitorId = :competitorId) " +

            // 2. 키워드 ID 필터: 파라미터가 null이면 DB도 NULL인 것만, 값이 있으면 해당 키워드만
            "AND (:keywordId IS NULL AND s.keywordId IS NULL OR s.keywordId = :keywordId) " +

            // 3. 프로젝트 ID 필터: 동일한 로직 적용
            "AND (:projectId IS NULL AND s.projectId IS NULL OR s.projectId = :projectId) " +

            // 4. 소스 및 기간 필터 (선택적 검색 조건)
            "AND (:source IS NULL OR s.source = :source) " +
            "AND (:startDate IS NULL OR s.statDate >= :startDate) " +
            "AND (:endDate IS NULL OR s.statDate <= :endDate) " +
            "ORDER BY s.statDate ASC")
    List<AnalyticsKeywordDailyStats> findByFilters(
            @Param("brandId") Long brandId,
            @Param("projectId") Long projectId,
            @Param("keywordId") Long keywordId,
            @Param("competitorId") Long competitorId,
            @Param("source") String source,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

