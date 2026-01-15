package com.InsightMarket.ai.dto.locationchatbot.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceInsightsDTO {

    private TrafficPeakDTO trafficPeak;
    private MainAgeGroupDTO mainAgeGroup;
    private SaturationDTO saturation;
    private List<TrafficSeriesDTO> trafficSeries;
}
