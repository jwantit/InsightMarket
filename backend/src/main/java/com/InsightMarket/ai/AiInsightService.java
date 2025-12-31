package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;

public interface AiInsightService {
    JsonNode ask(AiAskRequestDTO req, String traceId);
}
