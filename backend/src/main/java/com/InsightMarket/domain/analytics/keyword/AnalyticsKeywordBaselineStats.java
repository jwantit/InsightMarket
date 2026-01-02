package com.InsightMarket.domain.analytics.keyword;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

@Entity
@Table(
        name = "analytics_keyword_baseline_stats",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "brand_id", "analysis_target_type",
                        "project_id", "keyword_id", "competitor_id", "source"
                }
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AnalyticsKeywordBaselineStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long baselineId;

    @NotNull
    private Long brandId;

    private Long projectId;
    private Long keywordId;
    private Long competitorId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AnalysisTargetType analysisTargetType;

    @NotNull
    private String source;

    /** 평균 언급량 */
    @NotNull
    private Integer avgMentionCount;

    /** 표준 편차 */
    @NotNull
    private Integer stddevMentionCount;
}

