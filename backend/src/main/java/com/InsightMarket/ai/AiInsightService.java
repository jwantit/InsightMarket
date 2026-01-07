package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;

public interface AiInsightService {
    JsonNode askAiInsight(AiAskRequestDTO req, String traceId);
    JsonNode generateSolutionReport(SolutionReportRequestDTO req, String traceId);
    JsonNode saveReportAsSolution(com.InsightMarket.dto.ai.SaveReportRequestDTO req, String traceId);
    long getFreeReportCount(Long memberId);
}
