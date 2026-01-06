package com.InsightMarket.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandSentimentResponseDTO {

    // 가장 긍정 비율이 높았던 날 (예: "2026-01-01")
    private String mostPositiveDate;

    // 가장 긍정 비율이 낮았던 날 (부정 비율이 가장 높았던 날, 예: "2026-01-03")
    private String mostNegativeDate;

    // 긍부정 반응이 가장 활발했던 채널 (예: "네이버 블로그")
    private String topSource;

    //날짜 범위
    private String dateRange; //범위
//-------------------------------------------------------
    // 7일 평균 긍정도 값 (예: 65.4)
    private Double posValue; // 차트용 (42.7)
    private Double negValue; // 차트용 (30.2)
    private Double neuValue; // 차트용 (27.1)

    //긍정도% 띄우기용
    private String averagePositiveRatio;

}