package com.InsightMarket.ai.dto.aiInsight;

import lombok.Data;

@Data
public class SaveReportRequestDTO {
    private Long projectId;
    private String solutionTitle;
    private String reportContent;
    private String reportType; // "marketing" or "improvement"
}

