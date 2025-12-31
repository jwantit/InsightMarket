package com.InsightMarket.domain.analytics;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.project.Project;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "analytics_ai_answer",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ai_answer_prompt",
                        columnNames = "prompt_id"
                )
        }
)
@ToString(exclude = {"prompt", "brand", "project"})
public class AnalyticsAiAnswer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_answer_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_id", nullable = false, unique = true)
    private AnalyticsPrompt prompt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, columnDefinition = "BIT(1)")
    private Boolean ok;

    @Column(name = "elapsed_sec", nullable = false)
    private Double elapsedSec;

    // JSON 매핑 방식 선택:
    // 1) JsonNode: Jackson으로 파싱된 객체, 타입 안전성 높음, 조회 시 바로 사용 가능
    //    단점: DB에 저장 시 JSON 문자열로 변환 필요, MariaDB JSON 타입과 직접 매핑 어려움
    // 2) String: DB에 그대로 저장/조회, 단순함, 하지만 사용 시 매번 파싱 필요
    // 
    // 현재는 String 방식 사용 (MariaDB JSON 타입은 내부적으로 TEXT로 저장되므로)
    // 필요 시 Service 레이어에서 JsonNode로 변환하여 사용
    @Lob
    @Column(name = "response_json", nullable = false, columnDefinition = "JSON")
    private String responseJson;
}

