package com.InsightMarket.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SentimentStatsDTO {
    private Long sentimentDailyStatsId;
    private Long brandId;
    private Long projectId;
    private Long keywordId;
    private Long competitorId;
    private String analysisTargetType;
    private LocalDate statDate;
    private String source;
    private Double positiveRatio;
    private Double negativeRatio;
    private Double neutralRatio;
}

