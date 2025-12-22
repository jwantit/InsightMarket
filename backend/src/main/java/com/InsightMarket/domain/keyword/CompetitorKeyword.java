package com.InsightMarket.domain.keyword;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.company.Competitor;
import com.InsightMarket.domain.keyword.Keyword;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "competitor_keyword",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_competitor_keyword_competitor_keyword", columnNames = {"competitor_id", "keyword_id"})
        }
)
public class CompetitorKeyword extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "competitor_keyword_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competitor_id", nullable = false)
    private Competitor competitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyword_id", nullable = false)
    private Keyword keyword;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;
}
