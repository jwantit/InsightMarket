package com.InsightMarket.domain.analytics;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.project.Project;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "analytics_prompt",
        uniqueConstraints = {
                // 주의: member_id가 NULL일 수 있으므로, DB에 따라 UNIQUE 제약이 다르게 동작할 수 있음
                // MariaDB/MySQL: NULL 값은 UNIQUE 제약에서 제외되므로, member_id가 NULL인 경우 중복 허용 가능
                // PostgreSQL: NULL도 UNIQUE 제약에 포함됨
                // 현재는 MariaDB 기준으로 설정 (member_id NULL 허용)
                @UniqueConstraint(
                        name = "uk_prompt_project_member_question",
                        columnNames = {"project_id", "member_id", "question"}
                )
        }
)
@ToString(exclude = {"brand", "project", "member"})
public class AnalyticsPrompt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prompt_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Lob
    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "top_k", nullable = false)
    private Integer topK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromptStatus status;
}

