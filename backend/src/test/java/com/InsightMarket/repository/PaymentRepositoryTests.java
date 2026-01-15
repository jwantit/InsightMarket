package com.InsightMarket.repository;


import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.order.Orders;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.payment.OrderHistoryDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.repository.payment.PaymentRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;


@SpringBootTest
@Log4j2
public class PaymentRepositoryTests {

    @Autowired // 생성자 주입 대신 테스트 코드에서는 Autowired를 자주 사용합니다.
    private PaymentRepository paymentRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @Test
    @Transactional
    @Commit
    public void getAllHistory() {
        // 1. 테스트할 유저 설정
        String buyMemberEmail = "user7@aaa.com";

        // 2. 페이징 설정 (0페이지, 10개씩)
        Pageable pageable = PageRequest.of(0, 10);

        //멤버가져오기
        Optional<Member> member = memberRepository.findByEmail(buyMemberEmail);
        Member member1 = member.orElseThrow(() -> new RuntimeException("해당 이메일의 유저를 찾을 수 없습니다."));

        // 3. 멤버id에 해당하는 Orders 가져오기
        Page<Orders> result = paymentRepository.findMyOrders(member1.getId(), pageable);

        // 4. DTO 변환 로직
        List<OrderHistoryDTO> dtoList = result.getContent().stream()
                .map(order -> {
                    List<SolutionDTO> solutionDTOList = order.getOrderItems().stream()
                            .map(item -> {
                                Solution sol = item.getSolution();
                                return SolutionDTO.builder()
                                        .solutionid(item.getId())
                                        .title(item.getSolutionName())
                                        .price(item.getOrderPrice())
                                        .projectname(sol.getProject().getName())
                                        .strategytitle(sol.getStrategy().getTitle())
                                        .strategyId(sol.getStrategy().getId())
                                        .projectId(sol.getProject().getId())
                                        .build();
                            })
                            .toList();

                    return OrderHistoryDTO.builder()
                            .orderId(order.getId())
                            .merchantUid(order.getPaymentId())
                            .totalPrice(order.getTotalPrice())
                            .createdAt(order.getCreatedAt()
                                    .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분")))
                            .receiptUrl(order.getReceiptUrl())
                            .orderItems(solutionDTOList) // 변환된 리스트 주입
                            .build();
                })
                .toList();

        // 5. PageResponseDTO 구성 (테스트 코드에서는 return 대신 로그 출력을 위해 변수에 담습니다)
        PageResponseDTO<OrderHistoryDTO> responseDTO = PageResponseDTO.<OrderHistoryDTO>withAll()
                .dtoList(dtoList)
                .totalCount(result.getTotalElements())
                // 테스트용 PageRequestDTO 강제 생성 (실제 서비스에선 파라미터로 받음)
                .pageRequestDTO(com.InsightMarket.dto.PageRequestDTO.builder()
                        .page(1)
                        .size(10)
                        .build())
                .build();

        // 6. 결과 검증 로그
        // 6. 결과 검증 로그
        log.info("--------------------------------------");
        log.info("총 주문 건수: " + responseDTO.getTotalCount());

        responseDTO.getDtoList().forEach(orderDTO -> {
            log.info("주문번호: " + orderDTO.getMerchantUid()
                    + " | 결제금액: " + orderDTO.getTotalPrice()
                    + " | 포함된 솔루션 개수: " + orderDTO.getOrderItems().size()
                    + " | 결제일: " + orderDTO.getCreatedAt());


            orderDTO.getOrderItems().forEach(sol ->
                    log.info("   ㄴ 포함된 솔루션: {} | 프로젝트: {}({}) | 전략: {}({})",
                            sol.getTitle(),
                            sol.getProjectname(), sol.getProjectId(),
                            sol.getStrategytitle(), sol.getStrategyId()
                    )
            );
        }); // 👈 빠져있던 중괄호/괄호 닫기

        log.info("--------------------------------------");
    }
}


