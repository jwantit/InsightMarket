package com.InsightMarket.ai.dto.scheduler;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompetitorIdNameDTO {
    private Long competitorId;
    private String competitorName;
    private Long brandId;
}

