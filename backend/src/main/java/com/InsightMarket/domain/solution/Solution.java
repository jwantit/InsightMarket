package com.InsightMarket.domain.solution;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.domain.strategy.Strategy;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "solution")
public class Solution extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "solution_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id", nullable = false)
    private Strategy strategy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private int price;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    //추가했옹용
    @Column(columnDefinition = "TINYINT(1)")
    private boolean deleted = false;


}
