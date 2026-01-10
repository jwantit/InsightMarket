package com.InsightMarket.ai.dto.aiInsight;

import lombok.Data;
import java.util.List;

@Data
public class SolutionReportRequestDTO {
    private Long brandId;
    private String brandName;
    private Long projectId;
    private String projectName;
    private String question;
    private String solutionTitle;
    private String solutionDescription;
    private List<String> relatedProblems;
    private List<String> relatedInsights;
    private String keywordStatsSummary;
    private String reportType; // "marketing" or "improvement"
}

