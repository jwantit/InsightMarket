package com.InsightMarket.ai.locationchatbot.dto.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDocumentRowDTO {
    private String placeId;
    private String addressName;
    private String categoryGroupCode;
    private String categoryGroupName;
    private String categoryName;

    private String placeName;
    private String roadAddressName;

    private double x;
    private double y;


    private String desc;
    private int salesIndex;
    private int floatingPopulation;

    PlaceInsightsDTO placeInsights;


    private double distance;














}
