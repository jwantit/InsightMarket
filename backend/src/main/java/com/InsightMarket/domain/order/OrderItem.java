package com.InsightMarket.domain.order;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.solution.Solution;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "order_item")
public class OrderItem extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Orders order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solution_id")
    private Solution solution;

    // 변경 2: 결제 당시의 정보를 기록 (스냅샷)
    private String solutionName; // 결제 시점의 상품명

    private int orderPrice;    // 결제 시점의 개별 가격

    // Orders의 addOrderItem에서 호출하여 양방향을 연결해줍니다.
    public void setOrder(Orders order) {
        this.order = order;
    }
}

