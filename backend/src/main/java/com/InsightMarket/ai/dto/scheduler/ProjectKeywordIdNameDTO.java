package com.InsightMarket.ai.dto.scheduler;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectKeywordIdNameDTO {
    private Long projectKeywordId;
    private String projectKeywordName;
    private Long brandId;
    private String brandName;
    private Long projectId;
}

