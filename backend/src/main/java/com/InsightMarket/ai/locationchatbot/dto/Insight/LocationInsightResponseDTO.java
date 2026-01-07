package com.InsightMarket.ai.locationchatbot.dto.Insight;

import com.InsightMarket.ai.locationchatbot.dto.result.MainAgeGroupDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.SaturationDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.TrafficPeakDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.TrafficSeriesDTO;
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
