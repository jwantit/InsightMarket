package com.InsightMarket.service.payment;

import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.payment.OrderRequestDTO;
import com.InsightMarket.dto.payment.OrderResponseDTO;

public interface PaymentService {

    OrderResponseDTO prepareOrder(MemberDTO member, OrderRequestDTO requestDTO);
    //결제창에서 취소나 뒤로가기시 오더테이블 삭제
    void removeOrder(Long orderId);

    void verifyAndCompletePayment(String paymentId, Long orderId);
}
