package com.InsightMarket.domain.strategy;

import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "strategy")
public class Strategy extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strategy_id")
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;
}
