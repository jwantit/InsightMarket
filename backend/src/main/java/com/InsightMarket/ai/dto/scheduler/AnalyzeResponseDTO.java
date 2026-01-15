package com.InsightMarket.ai.dto.scheduler;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class AnalyzeResponseDTO {
    private String status;
    private String message;
    private JsonNode dailyStats;
    private JsonNode sentimentStats;
    private JsonNode tokenStats;
    private JsonNode baselineStats;
    private JsonNode insights;
}

