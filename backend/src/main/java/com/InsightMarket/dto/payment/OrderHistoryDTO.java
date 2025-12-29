package com.InsightMarket.dto.payment;

import com.InsightMarket.dto.solution.SolutionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderHistoryDTO {
    private Long orderId;        // 주문 PK
    private String merchantUid;  // 주문번호 (paymentId)
    private String buyerName;    // 구매자 이름
    private int totalPrice;      // 총 결제 금액
    private String createdAt;    // 결제 일시 (포맷팅된 문자열)
    private String receiptUrl;   // 포트원 영수증 URL

    // 상세 품목 리스트
    private List<SolutionDTO> orderItems;
}