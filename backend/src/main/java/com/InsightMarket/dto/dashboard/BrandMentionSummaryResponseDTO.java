package com.InsightMarket.dto.dashboard;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BrandMentionSummaryResponseDTO {

    private String weeklyGrowthRate; //저반주 대비

    private String insightMessage; //인사이트 멘트

    private String popularChannel; //인기채널
    private String peakDate; //언급량 많았던 날짜
    private String dateRange; //범위

}

