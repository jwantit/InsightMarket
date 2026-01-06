package com.InsightMarket.dashboard.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrandSentimentChartDataDTO {
    private String date;   // X축 날짜 (예: "2025-12-29")
    private double positive;
    private double negative;
    private double neutral;
}
