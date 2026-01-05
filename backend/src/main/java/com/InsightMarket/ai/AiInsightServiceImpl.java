package com.InsightMarket.ai;

import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.repository.strategy.StrategyRepository;
import com.InsightMarket.dto.ai.SaveReportRequestDTO;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.domain.strategy.Strategy;
import com.InsightMarket.domain.order.Orders;
import com.InsightMarket.domain.order.OrderItem;
import com.InsightMarket.domain.order.OrderStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.analytics.AnalyticsAiAnswer;
import com.InsightMarket.domain.analytics.AnalyticsPrompt;
import com.InsightMarket.domain.analytics.PromptStatus;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.repository.analytics.AnalyticsAiAnswerRepository;
import com.InsightMarket.repository.analytics.AnalyticsPromptRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.payment.PaymentRepository;
import com.InsightMarket.security.util.MemberUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInsightServiceImpl implements AiInsightService {

    // ============================================================
    // [기능] AI Insight 서비스 구현
    // - analytics_prompt 저장 → Python 호출 → analytics_ai_answer 저장 → prompt status 업데이트
    // ============================================================

    private final PythonRagClient pythonRagClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AnalyticsPromptRepository promptRepository;
    private final AnalyticsAiAnswerRepository answerRepository;
    private final BrandRepository brandRepository;
    private final ProjectRepository projectRepository;
    private final ProjectKeywordRepository projectKeywordRepository;
    private final SolutionRepository solutionRepository;
    private final StrategyRepository strategyRepository;
    private final PaymentRepository paymentRepository;
    private final MemberUtil memberUtil;

    private String summarizeReason(Exception e) {
        String msg = (e.getMessage() == null) ? "" : e.getMessage();
        if (msg.contains("TimeoutException") || msg.contains("timed out")) {
            return "AI 응답 지연(Timeout)";
        }
        if (msg.contains("Connection refused") || msg.contains("connect") || msg.contains("Connection")) {
            return "AI 서버 연결 실패";
        }
        return "AI 처리 중 오류";
    }

    private JsonNode buildFailResponse(String traceId, long elapsedMs, String reason) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("ok", false);
        root.set("data", NullNode.getInstance());
        root.set("sources", objectMapper.createArrayNode());
        root.put("reason", reason);
        root.put("traceId", traceId);
        root.put("elapsedSec", round3(elapsedMs / 1000.0));
        return root;
    }

    private double round3(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }
    
    @Override
    public JsonNode generateSolutionReport(SolutionReportRequestDTO req, String traceId) {
        try {
            log.info("[AiInsightServiceImpl] generateSolutionReport start traceId={} brandId={} solutionTitle={} reportType={}",
                    traceId, req.getBrandId(), req.getSolutionTitle(), req.getReportType());
            
            // Python 호출
            JsonNode pythonResponse = pythonRagClient.generateSolutionReport(req, traceId);
            
            log.info("[AiInsightServiceImpl] generateSolutionReport end traceId={} ok={}",
                    traceId, pythonResponse != null && pythonResponse.has("ok") && pythonResponse.get("ok").asBoolean());
            
            return pythonResponse;
        } catch (Exception e) {
            log.error("[AiInsightServiceImpl] generateSolutionReport error traceId={}", traceId, e);
            return buildFailResponse(traceId, 0, summarizeReason(e));
        }
    }
    
    @Override
    @Transactional
    public JsonNode saveReportAsSolution(SaveReportRequestDTO req, String traceId) {
        try {
            log.info("[AiInsightServiceImpl] saveReportAsSolution start traceId={} projectId={} solutionTitle={}",
                    traceId, req.getProjectId(), req.getSolutionTitle());
            
            // 1. Project 조회
            Project project = projectRepository.findById(req.getProjectId())
                    .orElseThrow(() -> new ApiException(ErrorCode.PROJECT_NOT_FOUND));
            
            // 2. 무료 제공 횟수 체크 (사용자당 1개까지 무료)
            Member currentMember = memberUtil.getCurrentMember();
            long freeReportCount = paymentRepository.countFreeReportsByMemberId(currentMember.getId());
            boolean isFree = freeReportCount < 1;
            int price = isFree ? 0 : 10000; // 무료면 0원, 유료면 10000원
            
            log.info("[AiInsightServiceImpl] freeReportCount={} isFree={} price={}", 
                    freeReportCount, isFree, price);
            
            // 3. Strategy 찾기 또는 생성 (솔루션 제목을 전략 제목으로 사용)
            Strategy strategy = strategyRepository.findByTitle(req.getSolutionTitle())
                    .orElseGet(() -> {
                        Strategy newStrategy = Strategy.builder()
                                .title(req.getSolutionTitle())
                                .build();
                        return strategyRepository.save(newStrategy);
                    });
            
            // 4. Solution 생성 및 저장
            // 무료 리포트는 isPurchased = true로 저장 (상품 목록에서 제외, 구매 내역에만 표시)
            // 유료 리포트는 isPurchased = false로 저장 (상품 목록에 표시)
            Solution solution = Solution.builder()
                    .strategy(strategy)
                    .project(project)
                    .title(req.getSolutionTitle() + " 리포트")
                    .price(price)
                    .description(req.getReportContent())
                    .isPurchased(isFree) // 무료면 true (상품 목록 제외), 유료면 false (상품 목록 표시)
                    .build();
            
            Solution savedSolution = solutionRepository.save(solution);
            
            // 5. 무료 리포트인 경우 Orders 생성 (구매 내역에 표시되도록)
            if (isFree) {
                Orders freeOrder = Orders.builder()
                        .buyMemberId(currentMember.getId())
                        .projectId(project.getId())
                        .paymentId("FREE-" + System.currentTimeMillis() + "-" + savedSolution.getId())
                        .totalPrice(0)
                        .status(OrderStatus.PAID) // 무료이지만 구매 완료 상태
                        .build();
                
                OrderItem orderItem = OrderItem.builder()
                        .solution(savedSolution)
                        .solutionName(savedSolution.getTitle())
                        .orderPrice(0)
                        .build();
                
                freeOrder.addOrderItem(orderItem);
                paymentRepository.save(freeOrder);
                
                log.info("[AiInsightServiceImpl] 무료 리포트 Orders 생성 orderId={} solutionId={}", 
                        freeOrder.getId(), savedSolution.getId());
            }
            
            log.info("[AiInsightServiceImpl] saveReportAsSolution end traceId={} solutionId={} isFree={}",
                    traceId, savedSolution.getId(), isFree);
            
            // 6. 응답 생성
            ObjectNode response = objectMapper.createObjectNode();
            response.put("ok", true);
            response.put("solutionId", savedSolution.getId());
            response.put("isFree", isFree);
            response.put("price", price);
            response.put("message", isFree ? "리포트가 무료로 생성되었습니다." : "리포트가 생성되었습니다. 구매가 필요합니다.");
            
            return response;
        } catch (Exception e) {
            log.error("[AiInsightServiceImpl] saveReportAsSolution error traceId={}", traceId, e);
            return buildFailResponse(traceId, 0, summarizeReason(e));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getFreeReportCount(Long memberId) {
        log.info("[AiInsightServiceImpl] getFreeReportCount memberId={}", memberId);
        return paymentRepository.countFreeReportsByMemberId(memberId);
    }
}

