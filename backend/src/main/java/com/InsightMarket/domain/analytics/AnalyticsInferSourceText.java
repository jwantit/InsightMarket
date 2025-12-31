package com.InsightMarket.domain.analytics;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.project.Project;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "analytics_infer_source_text",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_infer_source_text_project_hash",
                        columnNames = {"project_id", "raw_hash"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_proj_collect",
                        columnList = "project_id, collected_at"
                )
        }
)
@ToString(exclude = {"brand", "project"})
public class AnalyticsInferSourceText extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "infer_source_text_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // batch_id는 AnalyticsRawDataBatch 엔티티가 생성되면 연결
    // 현재는 FK 컬럼만 정의 (엔티티 관계는 나중에 추가)
    // @Column(name = "batch_id")
    // private Long batchId;

    @Column(nullable = false, length = 50)
    private String source;

    @Column(length = 1000)
    private String url;

    @Column(name = "raw_hash", nullable = false, length = 64)
    private String rawHash;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "collected_at", nullable = false)
    private LocalDateTime collectedAt;

    @Lob
    @Column(name = "infer_text", nullable = false, columnDefinition = "LONGTEXT")
    private String inferText;
}

