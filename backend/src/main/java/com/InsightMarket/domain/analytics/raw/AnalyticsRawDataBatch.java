package com.InsightMarket.domain.analytics.raw;

import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "analytics_raw_data_batch",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"project_id", "batch_no", "source"}
        ),
        indexes = {
                @Index(name = "idx_brand_collect", columnList = "brand_id, collected_at"),
                @Index(name = "idx_project_collect", columnList = "project_id, collected_at"),
                @Index(name = "idx_competitor_collect", columnList = "competitor_id, collected_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AnalyticsRawDataBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long batchId;

    @NotNull
    private Long brandId;

    @NotNull
    private Long projectId;

    private Long competitorId;

    @NotNull
    private Integer batchNo;

    @NotNull
    private String source;

    @NotNull
    @Column(columnDefinition = "json")
    private String keywords;

    @NotNull
    private String filePath;

    @NotNull
    private LocalDateTime collectedAt;
}