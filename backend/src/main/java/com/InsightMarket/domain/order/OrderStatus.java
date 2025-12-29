package com.InsightMarket.domain.order;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OrderStatus {
    READY("결제 대기"),
    PAID("결제 완료"),
    CANCELLED("주문 취소"),
    FAILED("결제 실패");

    private final String description;
}
