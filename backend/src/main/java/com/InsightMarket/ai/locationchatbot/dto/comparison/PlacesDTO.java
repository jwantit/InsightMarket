package com.InsightMarket.ai.locationchatbot.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlacesDTO {
    private String rank;
    private String placeId;
    private String placeName;
    private int salesIndex;
    private String desc;
}


