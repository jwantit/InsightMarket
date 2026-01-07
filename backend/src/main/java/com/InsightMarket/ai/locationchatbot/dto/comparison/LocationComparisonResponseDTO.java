package com.InsightMarket.ai.locationchatbot.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationComparisonResponseDTO {

    private Long radius;
    private int foundCount;
    private String bestPlaceId;
    private String worstPlaceId;
    private List<PlacesDTO> places;
    private String none;

}


