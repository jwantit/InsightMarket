package com.InsightMarket.service;


import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.payment.OrderHistoryDTO;
import com.InsightMarket.repository.payment.PaymentRepository;
import com.InsightMarket.service.payment.PaymentService;
import com.InsightMarket.service.payment.PaymentServiceImpl;
import com.InsightMarket.service.solution.SolutionService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Log4j2
@ToString
public class PaymentServiceTests {

    @Autowired
    private PaymentServiceImpl paymentService;

    @Test
    @Transactional
    @Commit
    public void testPaymentService() throws JsonProcessingException {

        PageRequestDTO pageRequestDTO = PageRequestDTO.builder()
                .page(1)
                .size(10).build();

        String memberEmail = "user7@aaa.com";

        PageResponseDTO<OrderHistoryDTO> rusult = paymentService.getPaymentDetailsByUser(pageRequestDTO, memberEmail);

        // 2. ObjectMapper 객체 생성 (Jackson)
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        // 3. 예쁘게 출력 (이 줄의 빨간 줄이 사라집니다)
        String json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rusult);

        log.info("=== 결제 내역 상세 결과 ===\n" + json);
    }
}
