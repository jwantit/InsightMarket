package com.InsightMarket.domain.order;

import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders")
public class Orders extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    private String paymentId; // 포트원 merchant_uid (결제 식별용 고유번호)

    @Column(name = "buyer_member_id")
    private Long buyMemberId; // 구매자 Member ID (Long으로 관리하여 탈퇴 시에도 기록 보존)

    private Long projectId; // 어느 프로젝트에서 발생한 구매인지

    private int totalPrice; // 최종 결제 금액

    private String receiptUrl; // 영수증 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status; // READY(준비), PAID(결제완료), CANCELLED(취소)

    // 주문 상세 품목과의 연결 (Cascade를 걸어 Order 저장 시 상세 내역도 자동 저장)
    @Builder.Default      //cascade = CascadeType.ALL -> oders 도메인 save시 아이템도 save
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    // --- 비즈니스 메서드 ---


     //총 금액 업데이트 (최종 검증용)
    public void updateTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
    }

    //결제완료처리
    public void complete() {
        this.status = OrderStatus.PAID;
    }

    // 결제 실패 처리
    public void fail() {
        this.status = OrderStatus.FAILED;
    }

    //연관관계 편의 메서드
    public void addOrderItem(OrderItem item) {
        this.orderItems.add(item);
        item.setOrder(this);
    }

    //영수증 저장
    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}