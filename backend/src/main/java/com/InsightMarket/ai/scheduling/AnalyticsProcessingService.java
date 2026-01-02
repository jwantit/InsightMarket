package com.InsightMarket.ai.scheduling;

import com.InsightMarket.ai.PythonRagClient;
import com.InsightMarket.domain.analytics.keyword.*;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.repository.analytics.keyword.*;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsProcessingService {

    private final PythonRagClient pythonRagClient;
    private final AnalyticsKeywordDailyStatsRepository dailyStatsRepository;
    private final AnalyticsKeywordSentimentDailyStatsRepository sentimentStatsRepository;
    private final AnalyticsKeywordTokenSentimentStatsRepository tokenStatsRepository;
    private final AnalyticsKeywordBaselineStatsRepository baselineStatsRepository;
    private final AnalyticsKeywordInsightResultRepository insightResultRepository;
    private final ProjectKeywordRepository projectKeywordRepository;

    @Transactional
    public JsonNode processAnalysis(String filePath, Long brandId, String traceId) {
        log.info("[AnalyticsProcessingService] processAnalysis start traceId={} filePath={} brandId={}",
                traceId, filePath, brandId);

        // 1. Python API 호출
        JsonNode response = pythonRagClient.analyze(filePath, brandId, traceId);

        if (response == null || !response.has("status") || !"success".equals(response.get("status").asText())) {
            String errorMsg = response != null && response.has("message") 
                    ? response.get("message").asText() 
                    : "Python API 호출 실패";
            log.error("[AnalyticsProcessingService] Python API 호출 실패: {}", errorMsg);
            throw new RuntimeException("분석 실패: " + errorMsg);
        }

        // 2. JSON 데이터를 엔티티로 변환 및 저장
        saveDailyStats(response.get("daily_stats"));
        saveSentimentStats(response.get("sentiment_stats"));
        saveTokenStats(response.get("token_stats"));
        saveBaselineStats(response.get("baseline_stats"));
        saveInsights(response.get("insights"));

        log.info("[AnalyticsProcessingService] processAnalysis end traceId={}", traceId);
        return response;
    }

    private void saveDailyStats(JsonNode dailyStatsNode) {
        if (dailyStatsNode == null || !dailyStatsNode.isArray()) {
            return;
        }

        List<AnalyticsKeywordDailyStats> entities = new ArrayList<>();
        for (JsonNode node : dailyStatsNode) {
            try {
                Long projectId = node.has("projectId") && !node.get("projectId").isNull() 
                        ? node.get("projectId").asLong() : null;
                Long keywordId = node.has("keywordId") && !node.get("keywordId").isNull() 
                        ? node.get("keywordId").asLong() : null;
                
                // project_id가 None이고 keyword_id가 있으면 ProjectKeyword에서 조회
                if (projectId == null && keywordId != null) {
                    projectKeywordRepository.findById(keywordId)
                            .ifPresent(pk -> {
                                // 람다 내부에서는 외부 변수를 변경할 수 없으므로
                                // Optional을 사용하여 값을 가져옴
                            });
                    // Optional을 사용하여 projectId 가져오기
                    projectId = projectKeywordRepository.findById(keywordId)
                            .map(pk -> pk.getProject().getId())
                            .orElse(null);
                }
                
                AnalyticsKeywordDailyStats entity = AnalyticsKeywordDailyStats.builder()
                        .brandId(node.get("brandId").asLong())
                        .projectId(projectId)
                        .keywordId(keywordId)
                        .competitorId(node.has("competitorId") && !node.get("competitorId").isNull() 
                                ? node.get("competitorId").asLong() : null)
                        .analysisTargetType(AnalysisTargetType.valueOf(node.get("analysisTargetType").asText()))
                        .statDate(LocalDate.parse(node.get("statDate").asText()))
                        .source(node.get("source").asText())
                        .mentionCount(node.get("mentionCount").asInt())
                        .build();
                entities.add(entity);
            } catch (Exception e) {
                log.warn("[AnalyticsProcessingService] daily_stats 변환 실패: {}", e.getMessage());
            }
        }

        // Upsert: UNIQUE 제약 조건에 따라 기존 레코드가 있으면 업데이트, 없으면 삽입
        for (AnalyticsKeywordDailyStats entity : entities) {
            dailyStatsRepository.save(entity);
        }
        log.info("[AnalyticsProcessingService] daily_stats 저장 완료: {}개", entities.size());
    }

    private void saveSentimentStats(JsonNode sentimentStatsNode) {
        if (sentimentStatsNode == null || !sentimentStatsNode.isArray()) {
            return;
        }

        List<AnalyticsKeywordSentimentDailyStats> entities = new ArrayList<>();
        for (JsonNode node : sentimentStatsNode) {
            try {
                Long projectId = node.has("projectId") && !node.get("projectId").isNull() 
                        ? node.get("projectId").asLong() : null;
                Long keywordId = node.has("keywordId") && !node.get("keywordId").isNull() 
                        ? node.get("keywordId").asLong() : null;
                
                // project_id가 None이고 keyword_id가 있으면 ProjectKeyword에서 조회
                if (projectId == null && keywordId != null) {
                    projectId = projectKeywordRepository.findById(keywordId)
                            .map(pk -> pk.getProject().getId())
                            .orElse(null);
                }
                
                AnalyticsKeywordSentimentDailyStats entity = AnalyticsKeywordSentimentDailyStats.builder()
                        .brandId(node.get("brandId").asLong())
                        .projectId(projectId)
                        .keywordId(keywordId)
                        .competitorId(node.has("competitorId") && !node.get("competitorId").isNull() 
                                ? node.get("competitorId").asLong() : null)
                        .analysisTargetType(AnalysisTargetType.valueOf(node.get("analysisTargetType").asText()))
                        .statDate(LocalDate.parse(node.get("statDate").asText()))
                        .source(node.get("source").asText())
                        .positiveRatio(node.get("positiveRatio").asDouble())
                        .negativeRatio(node.get("negativeRatio").asDouble())
                        .neutralRatio(node.get("neutralRatio").asDouble())
                        .build();
                entities.add(entity);
            } catch (Exception e) {
                log.warn("[AnalyticsProcessingService] sentiment_stats 변환 실패: {}", e.getMessage());
            }
        }

        for (AnalyticsKeywordSentimentDailyStats entity : entities) {
            sentimentStatsRepository.save(entity);
        }
        log.info("[AnalyticsProcessingService] sentiment_stats 저장 완료: {}개", entities.size());
    }

    private void saveTokenStats(JsonNode tokenStatsNode) {
        if (tokenStatsNode == null || !tokenStatsNode.isArray()) {
            return;
        }

        List<AnalyticsKeywordTokenSentimentStats> entities = new ArrayList<>();
        for (JsonNode node : tokenStatsNode) {
            try {
                Long projectId = node.has("projectId") && !node.get("projectId").isNull() 
                        ? node.get("projectId").asLong() : null;
                Long keywordId = node.has("keywordId") && !node.get("keywordId").isNull() 
                        ? node.get("keywordId").asLong() : null;
                
                // project_id가 None이고 keyword_id가 있으면 ProjectKeyword에서 조회
                if (projectId == null && keywordId != null) {
                    projectId = projectKeywordRepository.findById(keywordId)
                            .map(pk -> pk.getProject().getId())
                            .orElse(null);
                }
                
                AnalyticsKeywordTokenSentimentStats entity = AnalyticsKeywordTokenSentimentStats.builder()
                        .brandId(node.get("brandId").asLong())
                        .projectId(projectId)
                        .keywordId(keywordId)
                        .competitorId(node.has("competitorId") && !node.get("competitorId").isNull() 
                                ? node.get("competitorId").asLong() : null)
                        .analysisTargetType(AnalysisTargetType.valueOf(node.get("analysisTargetType").asText()))
                        .statDate(LocalDate.parse(node.get("statDate").asText()))
                        .source(node.get("source").asText())
                        .token(node.get("token").asText())
                        .sentiment(Sentiment.valueOf(node.get("sentiment").asText()))
                        .tokenCount(node.get("tokenCount").asInt())
                        .build();
                entities.add(entity);
            } catch (Exception e) {
                log.warn("[AnalyticsProcessingService] token_stats 변환 실패: {}", e.getMessage());
            }
        }

        for (AnalyticsKeywordTokenSentimentStats entity : entities) {
            tokenStatsRepository.save(entity);
        }
        log.info("[AnalyticsProcessingService] token_stats 저장 완료: {}개", entities.size());
    }

    private void saveBaselineStats(JsonNode baselineStatsNode) {
        if (baselineStatsNode == null || !baselineStatsNode.isArray()) {
            return;
        }

        List<AnalyticsKeywordBaselineStats> entities = new ArrayList<>();
        for (JsonNode node : baselineStatsNode) {
            try {
                Long projectId = node.has("projectId") && !node.get("projectId").isNull() 
                        ? node.get("projectId").asLong() : null;
                Long keywordId = node.has("keywordId") && !node.get("keywordId").isNull() 
                        ? node.get("keywordId").asLong() : null;
                
                // project_id가 None이고 keyword_id가 있으면 ProjectKeyword에서 조회
                if (projectId == null && keywordId != null) {
                    projectId = projectKeywordRepository.findById(keywordId)
                            .map(pk -> pk.getProject().getId())
                            .orElse(null);
                }
                
                AnalyticsKeywordBaselineStats entity = AnalyticsKeywordBaselineStats.builder()
                        .brandId(node.get("brandId").asLong())
                        .projectId(projectId)
                        .keywordId(keywordId)
                        .competitorId(node.has("competitorId") && !node.get("competitorId").isNull() 
                                ? node.get("competitorId").asLong() : null)
                        .analysisTargetType(AnalysisTargetType.valueOf(node.get("analysisTargetType").asText()))
                        .source(node.get("source").asText())
                        .avgMentionCount(node.get("avgMentionCount").asInt())
                        .stddevMentionCount(node.get("stddevMentionCount").asInt())
                        .build();
                entities.add(entity);
            } catch (Exception e) {
                log.warn("[AnalyticsProcessingService] baseline_stats 변환 실패: {}", e.getMessage());
            }
        }

        for (AnalyticsKeywordBaselineStats entity : entities) {
            baselineStatsRepository.save(entity);
        }
        log.info("[AnalyticsProcessingService] baseline_stats 저장 완료: {}개", entities.size());
    }

    private void saveInsights(JsonNode insightsNode) {
        if (insightsNode == null || !insightsNode.isArray()) {
            return;
        }

        List<AnalyticsKeywordInsightResult> entities = new ArrayList<>();
        for (JsonNode node : insightsNode) {
            try {
                Long projectId = node.has("projectId") && !node.get("projectId").isNull() 
                        ? node.get("projectId").asLong() : null;
                Long keywordId = node.has("keywordId") && !node.get("keywordId").isNull() 
                        ? node.get("keywordId").asLong() : null;
                
                // project_id가 None이고 keyword_id가 있으면 ProjectKeyword에서 조회
                if (projectId == null && keywordId != null) {
                    projectId = projectKeywordRepository.findById(keywordId)
                            .map(pk -> pk.getProject().getId())
                            .orElse(null);
                }
                
                AnalyticsKeywordInsightResult entity = AnalyticsKeywordInsightResult.builder()
                        .brandId(node.get("brandId").asLong())
                        .projectId(projectId)
                        .keywordId(keywordId)
                        .competitorId(node.has("competitorId") && !node.get("competitorId").isNull() 
                                ? node.get("competitorId").asLong() : null)
                        .analysisTargetType(AnalysisTargetType.valueOf(node.get("analysisTargetType").asText()))
                        .statDate(LocalDate.parse(node.get("statDate").asText()))
                        .source(node.get("source").asText())
                        .insightText(node.get("insightText").asText())
                        .confidenceScore(node.get("confidenceScore").asDouble())
                        .build();
                entities.add(entity);
            } catch (Exception e) {
                log.warn("[AnalyticsProcessingService] insights 변환 실패: {}", e.getMessage());
            }
        }

        for (AnalyticsKeywordInsightResult entity : entities) {
            insightResultRepository.save(entity);
        }
        log.info("[AnalyticsProcessingService] insights 저장 완료: {}개", entities.size());
    }
}

