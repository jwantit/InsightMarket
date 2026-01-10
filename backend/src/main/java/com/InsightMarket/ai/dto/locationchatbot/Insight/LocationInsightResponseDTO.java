package com.InsightMarket.ai.dto.locationchatbot.Insight;

import com.InsightMarket.ai.dto.locationchatbot.result.MainAgeGroupDTO;
import com.InsightMarket.ai.dto.locationchatbot.result.SaturationDTO;
import com.InsightMarket.ai.dto.locationchatbot.result.TrafficPeakDTO;
import com.InsightMarket.ai.dto.locationchatbot.result.TrafficSeriesDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LocationInsightResponseDTO {
    private String placeId;
    private String placeName;
    private TrafficPeakDTO trafficPeak;
    private MainAgeGroupDTO mainAgeGroup;
    private SaturationDTO saturation;
    private List<TrafficSeriesDTO> trafficSeries;
    private String none;
}
