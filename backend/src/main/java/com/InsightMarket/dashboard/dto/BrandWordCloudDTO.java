package com.InsightMarket.dashboard.dto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandWordCloudDTO {
    private String text; //긍 부정 키워드
    private Long value; //언급 카운트
    private String polarity; //긍정인지 부정인지
}
