package com.InsightMarket.ai.service.aiInsight;

import com.InsightMarket.ai.dto.aiInsight.AiAskRequestDTO;
import com.InsightMarket.ai.dto.aiInsight.SaveReportRequestDTO;
import com.InsightMarket.ai.dto.aiInsight.SolutionReportRequestDTO;
import com.fasterxml.jackson.databind.JsonNode;

public interface AiInsightService {
    JsonNode askAiInsight(AiAskRequestDTO req, String traceId);
    JsonNode generateSolutionReport(SolutionReportRequestDTO req, String traceId);
    JsonNode saveReportAsSolution(SaveReportRequestDTO req, String traceId);
    long getFreeReportCount(Long memberId);
}

