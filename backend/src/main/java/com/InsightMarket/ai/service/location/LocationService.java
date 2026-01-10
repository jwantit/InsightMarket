package com.InsightMarket.ai.service.location;

import com.InsightMarket.ai.dto.locationchatbot.Insight.LocationInsightResponseDTO;
import com.InsightMarket.ai.dto.locationchatbot.LocationRequestDTO;
import com.InsightMarket.ai.dto.locationchatbot.comparison.LocationComparisonResponseDTO;
import com.InsightMarket.ai.dto.locationchatbot.llm.LocationLLmResponseDTO;
import com.InsightMarket.ai.dto.locationchatbot.result.LocationAllDocumentDTO;


public interface LocationService  {

    LocationComparisonResponseDTO getOneLocation(LocationRequestDTO locationRequestDTO);

    LocationAllDocumentDTO loadFromJson(LocationRequestDTO locationRequestDTO);

    LocationInsightResponseDTO getInsightLocation(LocationRequestDTO locationRequestDTO);

    LocationLLmResponseDTO getConsulting(LocationRequestDTO locationRequestDTO);


}

