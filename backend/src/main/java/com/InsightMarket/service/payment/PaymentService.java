package com.InsightMarket.service.payment;

import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.payment.OrderHistoryDTO;
import com.InsightMarket.dto.payment.OrderRequestDTO;
import com.InsightMarket.dto.payment.OrderResponseDTO;
import com.InsightMarket.dto.solution.SolutionDTO;

public interface PaymentService {
     //주문서 생성
    OrderResponseDTO prepareOrder(MemberDTO member, OrderRequestDTO requestDTO);
    //결제창에서 취소나 뒤로가기시 오더테이블 삭제
    void removeOrder(Long orderId);
    //금액사후검증 (포트원)
    void verifyAndCompletePayment(String paymentId, Long orderId);

    //주문서 User단위 전체보기
    PageResponseDTO<OrderHistoryDTO> getPaymentDetailsByUser(PageRequestDTO pageRequestDTO , String memberName);
    //주문서 User + time 단위 보기 (필터)
}
