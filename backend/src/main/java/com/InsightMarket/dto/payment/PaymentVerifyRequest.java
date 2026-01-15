package com.InsightMarket.dto.payment;

import lombok.Data;

@Data
public class PaymentVerifyRequest {
    private String paymentId; // 포트원 결제 고유 번호
    private Long orderId;     // 우리 DB의 주문 PK
}