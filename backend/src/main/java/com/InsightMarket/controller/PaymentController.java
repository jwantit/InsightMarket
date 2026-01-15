package com.InsightMarket.controller;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.payment.OrderHistoryDTO;
import com.InsightMarket.dto.payment.OrderRequestDTO;
import com.InsightMarket.dto.payment.OrderResponseDTO;
import com.InsightMarket.dto.payment.PaymentVerifyRequest;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final WebClient portOneWebClient;
    private final MemberRepository memberRepository;
    private final PaymentService paymentService;

//결제 사전 준비 API------------------------------------------------------------------------------------------------
     //프론트에서 상품 정보를 보내면 DB에 주문(READY 상태)을 생성하고,
     //포트원 결제창 띄우기에 필요한 정보를 반환합니다.
    @PostMapping("/prepare")
    public ResponseEntity<OrderResponseDTO> prepareOrder(
            @RequestBody OrderRequestDTO requestDTO, //requestDTO {projectId , List[solutionId]}
            Authentication authentication) {

        log.info("컨트롤러 진입? " + authentication);

        // 실제 운영 환경에서는 Spring Security의 ContextHolder에서 현재 로그인한 유저 ID를 가져옵니다.
        // 현재는 테스트를 위해 임의의 memberId(예: 1L)를 사용하거나, 인증 로직에 따라 변경하세요.
        MemberDTO member = (MemberDTO) authentication.getPrincipal();
        log.info("authentication -> Member추출 " + member);

        OrderResponseDTO response = paymentService.prepareOrder(member, requestDTO);

        log.info("검증성공 response " + response);

        return ResponseEntity.ok(response);
    }
    //------------------------------------------------------------------------------------------------

    //결제 닫기나 취소시----------------------------------------------------------------------------------
    @DeleteMapping("/del/{orderId}")
    public ResponseEntity<String> cancelOrder(@PathVariable("orderId") Long orderId) {

        log.info("결제 취소 요청 - 주문 삭제 ID: {}", orderId);

        paymentService.removeOrder(orderId);

        return ResponseEntity.ok("주문이 정상적으로 삭제되었습니다.");
    }
    //------------------------------------------------------------------------------------------------

    //결제 사후검증단계---------------------------------------------------------------------------------
    //*금액대조,
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        try {
            // Service에서 포트원 API 호출 및 DB 금액 대조를 수행합니다.
            paymentService.verifyAndCompletePayment(request.getPaymentId(), request.getOrderId());

            return ResponseEntity.ok("결제 검증 및 완료 처리 성공");
        } catch (IllegalArgumentException e) {
            log.error("결제 검증 실패 (금액 불일치 등): {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("결제 처리 중 서버 에러 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("결제 처리 중 오류가 발생했습니다.");
        }
    }
    //------------------------------------------------------------------------------------------------






    //조회로직(구매내역 또는 거래내역)----------------------------------------------------------------------
    @GetMapping("/list/member")
    public PageResponseDTO<OrderHistoryDTO> paymentListByMember(
                               PageRequestDTO pageRequestDTO, Authentication authentication) {
        log.info("구매내역 리스트 진입 기준(member) PaymentController ? " + authentication);
        MemberDTO member = (MemberDTO) authentication.getPrincipal();
        log.info("요청객체" + pageRequestDTO);


        //날짜 조회필터
        if (pageRequestDTO.getFrom() != null || pageRequestDTO.getTo() != null){
            if (pageRequestDTO.getFrom() == null){
                pageRequestDTO.setFromDefault();
            }
            if (pageRequestDTO.getTo() == null){
                pageRequestDTO.setToDefault();
            }
            log.info("날짜필터링 시작");
        }

        PageResponseDTO<OrderHistoryDTO> dtoList = paymentService.getPaymentDetailsByUser(pageRequestDTO, member.getEmail());
    return dtoList;
    }
    //----------------------------------------------------------------------
}




