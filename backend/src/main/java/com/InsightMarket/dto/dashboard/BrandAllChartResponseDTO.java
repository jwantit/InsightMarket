package com.InsightMarket.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BrandAllChartResponseDTO {
    private String unit; //월별 주별 일별
    private List<BrandMentionChartDataDTO> chartData; // 실제 차트 포인트 배열
    private List<BrandSentimentChartDataDTO> sentiment; // 실제 차트 포인트 배열
}

