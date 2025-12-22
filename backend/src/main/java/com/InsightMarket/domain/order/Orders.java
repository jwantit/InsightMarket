package com.InsightMarket.domain.order;

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
@Table(name = "orders") // order는 예약어 충돌 가능성이 있어서 orders 추천
public class Orders extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_member_id", nullable = false)
    private Member buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "total_price", nullable = false)
    private int totalPrice; // 총 금액 기준으로 작성
}
