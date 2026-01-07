package com.InsightMarket.ai.locationchatbot.service;

import com.InsightMarket.ai.locationchatbot.dto.Insight.LocationInsightResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.LocationRequestDTO;
import com.InsightMarket.ai.locationchatbot.dto.comparison.LocationComparisonResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.llm.LocationLLmResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.LocationAllDocumentDTO;


public interface LocationService  {

    LocationComparisonResponseDTO getOneLocation(LocationRequestDTO locationRequestDTO);

    LocationAllDocumentDTO loadFromJson(LocationRequestDTO locationRequestDTO);

    LocationInsightResponseDTO getInsightLocation(LocationRequestDTO locationRequestDTO);

    LocationLLmResponseDTO getConsulting(LocationRequestDTO locationRequestDTO);


}
