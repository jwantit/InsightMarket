package com.InsightMarket.service.payment;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.order.OrderItem;
import com.InsightMarket.domain.order.OrderStatus;
import com.InsightMarket.domain.order.Orders;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.payment.OrderHistoryDTO;
import com.InsightMarket.dto.payment.OrderItemDTO;
import com.InsightMarket.dto.payment.OrderRequestDTO;
import com.InsightMarket.dto.payment.OrderResponseDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.repository.payment.PaymentRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.service.payment.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final SolutionRepository solutionRepository;
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final WebClient portOneWebClient;



    //목적 프론트-> 구매버튼 -> 백엔드 (주문서 제작)
    @Override
    @Transactional                       //회원 객체  ,  requestDTO {projectId , List[solutionId :n]}
    public OrderResponseDTO prepareOrder(MemberDTO member, OrderRequestDTO requestDTO) {
        
        String memberEmail = member.getEmail(); //회원 이메일 추출
        String memberName = member.getName(); //회원 이름 추출

       
        log.info("서비스 멤버 이메일 " + memberEmail);
        log.info("서비스 멤버 이름 " + memberName);

        //멤버 이메일로 멤버 찾기
        Member memberFind = memberRepository.findByEmail(memberEmail)
                 .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        log.info("멤버 리파시토리 멤버찾기 " + memberFind);


        // 고유 주문번호 생성
        String merchantUid = "ORD-" + UUID.randomUUID().toString().substring(0, 8);
        log.info("주문번호 생성 " + merchantUid);

        // 주문 마스터(Orders) 생성
        Orders orders = Orders.builder()
                .paymentId(merchantUid) //고유 주문번호
                .buyMemberId(memberFind.getId()) //구매자 (member)PK 담기 
                .projectId(requestDTO.getProjectId()) //프로젝트 id
                .status(OrderStatus.READY) //주문 상태 (대기, 완료등) 여기서는 대기상태
                .build();
        log.info("주문 마스터 빌더 " + orders);

        int total = 0; //주문 가격 총합
        String firstSolutionTitle = "";

        // 아이템 담기
        //OrderItemDTO{private Long solutionId;} : {[solutions : n]}
        for (OrderItemDTO itemDTO : requestDTO.getSolutions()){
            //솔루션 아이디에 해당하는 솔루션 찾기
            Solution solution = solutionRepository.findById(itemDTO.getSolutionId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품"));
            log.info("솔루션 찾기 " + solution);

            if (total == 0){ //첫번째 솔루션 이름가져오기
                firstSolutionTitle = solution.getTitle();
            }
            //오더 아이템 빌더
            //약한 연관 아이템은 솔루션 전체가 아닌 PK값만 넣는다.
            OrderItem orderItem = OrderItem.builder()
                    .solution(solution) //솔루션
                    .solutionName(solution.getTitle())//솔루션 이름
                    .orderPrice(solution.getPrice()) //솔루션 가격
                    .build();
            log.info("오더아이템 빌더 " + solution);
            

            //오더 도메인의 리스트에 오더 아이템 추가
            //추가로 item.setOrder(this); 을통해 orderItem 의 Oders FK에도 참조값 들억여 양방향 
            //cascade = CascadeType.ALL, 을 통해 orders 저장시 아이템도 같이 저장
            orders.addOrderItem(orderItem);

            total += solution.getPrice(); //솔루션 가격을 계산

            log.info("빌더 최종오더 " + orders);
        }

        // 총 금액 업데이트 및 저장
        orders.updateTotalPrice(total); //오더 도메인에 토탈 가격 set
        Orders ordersGetid = paymentRepository.save(orders); //저장
        Long orderId = ordersGetid.getId();
        log.info("빌더 최종 DB저장 " + orders);


        String orderName = (requestDTO.getSolutions().size() > 1)
                ? firstSolutionTitle + " 외 " + (requestDTO.getSolutions().size() - 1) + "건"
                : firstSolutionTitle;

        // 5. 프론트엔드로 돌려줄 데이터 구성 (이 부분이 추가되었습니다)
        return OrderResponseDTO.builder()
                .orderId(orderId) //오더 테이블 id
                .merchantUid(merchantUid) //고유 주문번호
                .totalAmount(total) //주문 총 가격
                .buyerName(memberName) //구매자 이름
                .orderName(orderName)
                .build();
    }

    @Override
    @Transactional
    public void removeOrder(final Long orderId) {
        log.info("결제 취소로 인한 주문 완전 삭제 시작. 주문 PK: " + orderId);

        // 해당 주문이 존재하는지 확인
        Orders order = paymentRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. ID: " + orderId));

        // 삭제 실행 (CascadeType.ALL에 의해 연관된 OrderItem도 같이 삭제됨)
        paymentRepository.delete(order);

        log.info("주문 및 관련 아이템 삭제 완료. ID: " + orderId);
    }

    @Override
    @Transactional
    public void verifyAndCompletePayment(String paymentId, Long orderId) {

        //포트원 API 응답
        // public WebClient portOneWebClient()
        Map<String, Object> paymentResponse = portOneWebClient.get()
                // .baseUrl("https://api.portone.io") 뒤에 붙는다,
                //https://api.portone.io/payment/dffweg
                .uri("/payments/{paymentId}", paymentId)
                //요청하여 응답받기.
                .retrieve()
                //바디(Body)에 담긴 데이터를 내가 원하는 객체 타입으로 변환 포트원의 JSON -> Map형태로 담기
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();//"포트원 서버에서 대답이 올 때까지 대기하자

        //검증을 위해 오더테이블 가져오기
        Orders orders = paymentRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다."));


        //{ 포트원에서 받는객체 ---------------------------------------------------------
            //"id": "payment-12345",
                //"status": "PAID",
               // "amount": {
                    //"total": 15000,
                    //"taxFree": 0,
                    //"vat": 1364,
                    //"currency": "KRW"
       // },
            //"method": { ... },
           // "receiptUrl": "https://..."


        //포트원 API응답에서 amount 가격을 꺼내온다.
        Map<String, Object> amountInfo = (Map<String, Object>) paymentResponse.get("amount");

        int actualPaidAmount = ((Number) amountInfo.get("total")).intValue();

        //금액비교 주문요청서와 실제 경제금액 비교과정
        if (orders.getTotalPrice() != actualPaidAmount) {
            // 금액이 다르면 해킹이나 조작으로 간주하고 환불진행
            orders.fail();
            portOneWebClient.post()
                    .uri("/payments/" + orders.getPaymentId() + "/cancel") // 포트원 V2 기준 취소 API 엔드포인트
                    .bodyValue(Map.of("reason", "결제 금액 불일치(위변조 의심)"))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            throw new IllegalStateException("결제 금액이 일치하지 않아 자동 환불되었습니다. 다시 시도해주세요.");
        }

        //PAID일시 결제는 성공적으로 진행됐다.
        String status = (String) paymentResponse.get("status");
        if (!"PAID".equals(status)) { //PAID가 아닐시 결제는 안된상태
            throw new IllegalStateException("결제가 완료되지 않은 상태입니다. 상태: " + status);
        }

        String receiptUrl = (String) paymentResponse.get("receiptUrl");
        log.info("포트원에서 받은 영수증 URL: " + receiptUrl);

        orders.complete();
        orders.setReceiptUrl(receiptUrl);

            //OrderItem 행
        for (OrderItem item : orders.getOrderItems()) {
            Solution solution = item.getSolution();
            if (solution != null) {
                solution.markAsPurchased(); // isPurchased = true / 결제완료 필터
            }
        }

    }

//-------------------------------------------------------------------------------------------




    
    //거래내역 조회로직 User기준 PAID(결제완료) 인 것들만 조회
    //--------------------------------------------------------------------------------------------------------------
    @Override
    public PageResponseDTO<OrderHistoryDTO> getPaymentDetailsByUser(PageRequestDTO pageRequestDTO, String memberEmail) {

        //    //프로젝트 단위 모든 솔루션 상품조회
//        public class PageRequestDTO {
//            private int page = 1;
//            private int size = 10;
        //    private String sort;   -> 종류 최신순latest 높은금액순pricehigh 금액낮은순pricelow
//            Long projectid;
//        }

        Sort sortCondition = switch (pageRequestDTO.getSort()) {
            case "pricehigh" -> Sort.by("totalPrice").descending();
            case "pricelow"  -> Sort.by("totalPrice").ascending();
            default -> Sort.by("id").descending();
        };

        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1,  //페이지 시작 번호가 0부터 시작하므로
                pageRequestDTO.getSize(),
                sortCondition
                );

        Optional<Member> memberFind = memberRepository.findByEmail(memberEmail);
        Member member = memberFind.orElseThrow(() -> new RuntimeException("해당 이메일의 유저를 찾을 수 없습니다."));

        String memberName = member.getName();

        //----필터
        if (pageRequestDTO.getFrom() != null && pageRequestDTO.getTo() != null){

            LocalDateTime start = pageRequestDTO.getFromDateTime();
            LocalDateTime end = pageRequestDTO.getToDateTime();

            Page<Orders> result = paymentRepository.findMyOrdersTime(member.getId(),start,end,pageable );
            PageResponseDTO<OrderHistoryDTO> dtoList = setDto(result, pageRequestDTO,memberName);
            return dtoList;
        }


        Page<Orders> result = paymentRepository.findMyOrders(member.getId(), pageable);

        PageResponseDTO<OrderHistoryDTO> dtoList = setDto(result, pageRequestDTO,memberName);

        return dtoList;
    } //--------------------------------------------------------------------------------------------------------------


    //공통로직 페이징 처리된 DTO를 처리하기 위함---------------------------------------------------------------------------
    public PageResponseDTO<OrderHistoryDTO> setDto(Page<Orders> result, PageRequestDTO pageRequestDTO, String memberName ){

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
                            .buyerName(memberName)
                            .totalPrice(order.getTotalPrice())
                            .orderTitle(
                                    order.getOrderItems().isEmpty() ? "구매 내역 없음" :
                                            order.getOrderItems().get(0).getSolution().getTitle() +
                                                    (order.getOrderItems().size() > 1 ? " 외 " + (order.getOrderItems().size() - 1) + "건" : "")
                            )
                            .createdAt(order.getCreatedAt()
                                    .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분")))
                            .receiptUrl(order.getReceiptUrl())
                            .orderItems(solutionDTOList) // 변환된 리스트 주입
                            .build();
                })
                .toList();

        long totalCount = result.getTotalElements();

        return PageResponseDTO.<OrderHistoryDTO>withAll()
                .dtoList(dtoList)
                .totalCount(totalCount)
                .pageRequestDTO(pageRequestDTO)
                .build();
    }

}