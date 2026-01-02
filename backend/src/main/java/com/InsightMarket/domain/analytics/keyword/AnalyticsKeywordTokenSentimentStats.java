package com.InsightMarket.domain.analytics.keyword;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;

@Entity
@Table(
        name = "analytics_keyword_token_sentiment_stats",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {
                        "brand_id", "analysis_target_type",
                        "project_id", "keyword_id", "competitor_id",
                        "stat_date", "token", "sentiment", "source"
                }
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AnalyticsKeywordTokenSentimentStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tokenStatsId;

    @NotNull
    @Column(nullable = false)
    private Long brandId;

    private Long projectId;
    private Long keywordId;
    private Long competitorId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisTargetType analysisTargetType;

    @NotNull
    private LocalDate statDate;

    @NotNull
    @Column(length = 50)
    private String source;

    @NotNull
    @Column(length = 100)
    private String token;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;

    @NotNull
    private Integer tokenCount;
}

