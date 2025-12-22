package com.InsightMarket.domain.keyword;

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
        name = "project_keyword",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_project_keyword_project_keyword", columnNames = {"project_id", "keyword_id"})
        }
)
public class ProjectKeyword extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_keyword_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyword_id", nullable = false)
    private Keyword keyword;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;
}
