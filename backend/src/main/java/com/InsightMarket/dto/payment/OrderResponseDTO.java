package com.InsightMarket.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long orderId;

    // 1. 포트원 결제창 호출 시 'merchant_uid'로 사용될 고유 주문번호
    private String merchantUid;

    // 2. 서버가 DB 가격을 바탕으로 최종 계산한 실제 결제 금액
    private int totalAmount;

    // 3. 결제창에 표시될 주문 명칭 (예: "솔루션 A 외 2건")
    private String orderName;

    // 5. (선택사항) 구매자 이름
    private String buyerName;
}