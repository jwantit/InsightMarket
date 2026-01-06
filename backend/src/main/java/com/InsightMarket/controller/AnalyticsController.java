package com.InsightMarket.controller;

import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordDailyStats;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordInsightResult;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordSentimentDailyStats;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordTokenSentimentStats;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.dto.analytics.*;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordDailyStatsRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordInsightResultRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordSentimentDailyStatsRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordTokenSentimentStatsRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{brandId}/analytics")
public class AnalyticsController {

    private final AnalyticsKeywordInsightResultRepository insightResultRepository;
    private final AnalyticsKeywordDailyStatsRepository dailyStatsRepository;
    private final AnalyticsKeywordSentimentDailyStatsRepository sentimentStatsRepository;
    private final AnalyticsKeywordTokenSentimentStatsRepository tokenStatsRepository;
    private final ProjectRepository projectRepository;
    private final ProjectKeywordRepository projectKeywordRepository;

    @GetMapping("/insights")
    public ResponseEntity<List<InsightSummaryDTO>> getInsights(
            @PathVariable Long brandId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long keywordId,
            @RequestParam(required = false) String source
    ) {
        log.info("[AnalyticsController] GET /insights brandId={}, projectId={}, keywordId={}, source={}",
                brandId, projectId, keywordId, source);

        List<AnalyticsKeywordInsightResult> insights = insightResultRepository.findLatestInsights(
                brandId, projectId, keywordId, source
        );

        List<InsightSummaryDTO> dtos = insights.stream()
                .map(this::toInsightDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/daily-stats")
    public ResponseEntity<List<DailyStatsDTO>> getDailyStats(
            @PathVariable Long brandId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long keywordId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("[AnalyticsController] GET /daily-stats brandId={}, projectId={}, keywordId={}, source={}, startDate={}, endDate={}",
                brandId, projectId, keywordId, source, startDate, endDate);

        List<AnalyticsKeywordDailyStats> stats = dailyStatsRepository.findByFilters(
                brandId, projectId, keywordId, source, startDate, endDate
        );

        List<DailyStatsDTO> dtos = stats.stream()
                .map(this::toDailyStatsDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/sentiment-stats")
    public ResponseEntity<List<SentimentStatsDTO>> getSentimentStats(
            @PathVariable Long brandId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long keywordId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("[AnalyticsController] GET /sentiment-stats brandId={}, projectId={}, keywordId={}, source={}, startDate={}, endDate={}",
                brandId, projectId, keywordId, source, startDate, endDate);

        List<AnalyticsKeywordSentimentDailyStats> stats = sentimentStatsRepository.findByFilters(
                brandId, projectId, keywordId, source, startDate, endDate
        );

        List<SentimentStatsDTO> dtos = stats.stream()
                .map(this::toSentimentStatsDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectDTO>> getProjects(@PathVariable Long brandId) {
        log.info("[AnalyticsController] GET /projects brandId={}", brandId);

        List<Project> projects = projectRepository.findByBrandIdOrderByStartDateDesc(brandId);

        List<ProjectDTO> dtos = projects.stream()
                .map(p -> ProjectDTO.builder()
                        .projectId(p.getId())
                        .name(p.getName())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/projects/{projectId}/keywords")
    public ResponseEntity<List<KeywordDTO>> getProjectKeywords(
            @PathVariable Long brandId,
            @PathVariable Long projectId
    ) {
        log.info("[AnalyticsController] GET /projects/{}/keywords brandId={}", projectId, brandId);

        // 프로젝트가 해당 브랜드에 속하는지 확인
        projectRepository.findByIdAndBrandId(projectId, brandId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found or does not belong to brand"));

        List<ProjectKeyword> keywords = projectKeywordRepository.findByProjectId(projectId);

        List<KeywordDTO> dtos = keywords.stream()
                .map(k -> KeywordDTO.builder()
                        .keywordId(k.getId())
                        .keyword(k.getKeyword())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/token-stats")
    public ResponseEntity<List<TokenStatsDTO>> getTokenStats(
            @PathVariable Long brandId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long keywordId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        log.info("[AnalyticsController] GET /token-stats brandId={}, projectId={}, keywordId={}, source={}, startDate={}, endDate={}",
                brandId, projectId, keywordId, source, startDate, endDate);

        List<AnalyticsKeywordTokenSentimentStats> stats = tokenStatsRepository.findByFilters(
                brandId, projectId, keywordId, source, startDate, endDate
        );

        List<TokenStatsDTO> dtos = stats.stream()
                .map(this::toTokenStatsDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    private InsightSummaryDTO toInsightDTO(AnalyticsKeywordInsightResult entity) {
        return InsightSummaryDTO.builder()
                .insightId(entity.getInsightId())
                .brandId(entity.getBrandId())
                .projectId(entity.getProjectId())
                .keywordId(entity.getKeywordId())
                .competitorId(entity.getCompetitorId())
                .analysisTargetType(entity.getAnalysisTargetType().name())
                .statDate(entity.getStatDate())
                .source(entity.getSource())
                .insightText(entity.getInsightText())
                .confidenceScore(entity.getConfidenceScore())
                .build();
    }

    private DailyStatsDTO toDailyStatsDTO(AnalyticsKeywordDailyStats entity) {
        return DailyStatsDTO.builder()
                .keywordDailyStatsId(entity.getKeywordDailyStatsId())
                .brandId(entity.getBrandId())
                .projectId(entity.getProjectId())
                .keywordId(entity.getKeywordId())
                .competitorId(entity.getCompetitorId())
                .analysisTargetType(entity.getAnalysisTargetType().name())
                .statDate(entity.getStatDate())
                .source(entity.getSource())
                .mentionCount(entity.getMentionCount())
                .build();
    }

    private SentimentStatsDTO toSentimentStatsDTO(AnalyticsKeywordSentimentDailyStats entity) {
        return SentimentStatsDTO.builder()
                .sentimentDailyStatsId(entity.getSentimentDailyStatsId())
                .brandId(entity.getBrandId())
                .projectId(entity.getProjectId())
                .keywordId(entity.getKeywordId())
                .competitorId(entity.getCompetitorId())
                .analysisTargetType(entity.getAnalysisTargetType().name())
                .statDate(entity.getStatDate())
                .source(entity.getSource())
                .positiveRatio(entity.getPositiveRatio())
                .negativeRatio(entity.getNegativeRatio())
                .neutralRatio(entity.getNeutralRatio())
                .build();
    }

    private TokenStatsDTO toTokenStatsDTO(AnalyticsKeywordTokenSentimentStats entity) {
        return TokenStatsDTO.builder()
                .tokenStatsId(entity.getTokenStatsId())
                .brandId(entity.getBrandId())
                .projectId(entity.getProjectId())
                .keywordId(entity.getKeywordId())
                .competitorId(entity.getCompetitorId())
                .analysisTargetType(entity.getAnalysisTargetType().name())
                .statDate(entity.getStatDate())
                .source(entity.getSource())
                .token(entity.getToken())
                .sentiment(entity.getSentiment().name())
                .tokenCount(entity.getTokenCount())
                .build();
    }
}

