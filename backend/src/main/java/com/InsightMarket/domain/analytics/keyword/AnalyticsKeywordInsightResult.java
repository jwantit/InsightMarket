package com.InsightMarket.domain.analytics.keyword;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Entity
@Table(
        name = "analytics_keyword_insight_result",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "brand_id", "analysis_target_type",
                        "project_id", "keyword_id", "competitor_id",
                        "stat_date", "source"
                }
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AnalyticsKeywordInsightResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long insightId;

    @NotNull
    private Long brandId;

    private Long projectId;
    private Long keywordId;
    private Long competitorId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AnalysisTargetType analysisTargetType;

    @NotNull
    private LocalDate statDate;

    @NotNull
    private String source;

    @NotNull
    @Lob
    private String insightText;

    @NotNull
    @Column(nullable = false, columnDefinition = "DECIMAL(4,2)")
    private Double confidenceScore;
}