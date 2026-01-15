package com.InsightMarket.domain.keyword;

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
@Table(name = "project_keyword")
public class ProjectKeyword extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_keyword_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String keyword; // 정규화된 형태(소문자/공백정리)

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;

    public void changeEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
