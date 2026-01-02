package com.InsightMarket.domain.analytics.keyword;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Entity
@Table(
        name = "analytics_keyword_daily_stats",
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
public class AnalyticsKeywordDailyStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long keywordDailyStatsId;

    @NotNull
    @Column(nullable = false)
    private Long brandId;

    @Column(nullable = true)
    private Long projectId;

    @Column(nullable = true)
    private Long keywordId;

    @Column(nullable = true)
    private Long competitorId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnalysisTargetType analysisTargetType;

    @NotNull
    @Column(nullable = false)
    private LocalDate statDate;

    @NotNull
    @Column(nullable = false, length = 50)
    private String source;

    @NotNull
    @Column(nullable = false)
    private Integer mentionCount;
}