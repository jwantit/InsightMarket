package com.InsightMarket.ai;

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
import com.InsightMarket.repository.analytics.AnalyticsAiAnswerRepository;
import com.InsightMarket.repository.analytics.AnalyticsPromptRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.project.ProjectRepository;
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
    private final MemberUtil memberUtil;

    @Override
    @Transactional
    public JsonNode ask(AiAskRequestDTO req, String traceId) {
        long start = System.currentTimeMillis();
        AnalyticsPrompt prompt = null;

        try {
            log.info("[AiInsightServiceImpl] ask start traceId={} brandId={} questionLen={}",
                    traceId, req.getBrandId(), req.getQuestion() != null ? req.getQuestion().length() : 0);

            // 1) Brand 조회
            Brand brand = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));

            // 2) Project 조회 (brandId로 가장 최근 프로젝트 사용)
            List<Project> projects = projectRepository.findByBrandIdOrderByStartDateDesc(req.getBrandId());
            if (projects.isEmpty()) {
                throw new ApiException(ErrorCode.PROJECT_NOT_FOUND);
            }
            Project project = projects.get(0);
            log.info("[AiInsightServiceImpl] selected project projectId={} projectName={}",
                    project.getId(), project.getName());

            // 3) Member 조회 (JWT에서, 없으면 null 허용)
            Member member = null;
            try {
                member = memberUtil.getCurrentMember();
                log.info("[AiInsightServiceImpl] current member memberId={}", member != null ? member.getId() : null);
            } catch (Exception e) {
                log.warn("[AiInsightServiceImpl] member not found or not authenticated, continuing without member", e);
            }

            // 4) analytics_prompt 저장 (UNIQUE 충돌 시 기존 레코드 재사용)
            prompt = findOrCreatePrompt(brand, project, member, req.getQuestion(), req.getTopK());
            log.info("[AiInsightServiceImpl] prompt saved/retrieved promptId={} status={}",
                    prompt.getId(), prompt.getStatus());

            // 5) Python 호출
            JsonNode pythonResponse = pythonRagClient.ask(req, traceId);
            long elapsedMs = System.currentTimeMillis() - start;
            double elapsedSec = round3(elapsedMs / 1000.0);

            boolean isOk = pythonResponse != null && pythonResponse.has("ok") && pythonResponse.get("ok").asBoolean();

            // 6) analytics_ai_answer 저장 (UNIQUE 충돌 시 update)
            saveOrUpdateAnswer(prompt, brand, project, isOk, elapsedSec, pythonResponse);

            // 7) prompt status 업데이트
            prompt = updatePromptStatus(prompt, isOk ? PromptStatus.SUCCESS : PromptStatus.FAILED);

            log.info("[AiInsightServiceImpl] ask end traceId={} promptId={} ok={} elapsedSec={}",
                    traceId, prompt.getId(), isOk, elapsedSec);

            return pythonResponse;

        } catch (ApiException e) {
            // ApiException은 그대로 전파
            throw e;
        } catch (Exception e) {
            long elapsedMs = System.currentTimeMillis() - start;
            String reason = summarizeReason(e);

            log.error("[AiInsightServiceImpl] ask fail traceId={} elapsedMs={} reason={} ex={}",
                    traceId, elapsedMs, reason, e.toString(), e);

            // prompt가 생성되었으면 status를 FAILED로 업데이트
            if (prompt != null) {
                try {
                    updatePromptStatus(prompt, PromptStatus.FAILED);
                } catch (Exception updateEx) {
                    log.error("[AiInsightServiceImpl] failed to update prompt status", updateEx);
                }
            }

            // 기존 계약 유지: ok=false 형태로 반환
            return buildFailResponse(traceId, elapsedMs, reason);
        }
    }

    /**
     * UNIQUE(project_id, member_id, question) 충돌 시 기존 레코드 재사용
     * 없으면 새로 생성 (status=REQUESTED)
     */
    private AnalyticsPrompt findOrCreatePrompt(Brand brand, Project project, Member member,
                                               String question, Integer topK) {
        return promptRepository.findByProjectAndMemberAndQuestion(project, member, question)
                .orElseGet(() -> {
                    AnalyticsPrompt newPrompt = AnalyticsPrompt.builder()
                            .brand(brand)
                            .project(project)
                            .member(member)
                            .question(question)
                            .topK(topK != null ? topK : 5)
                            .status(PromptStatus.REQUESTED)
                            .build();
                    return promptRepository.save(newPrompt);
                });
    }

    /**
     * UNIQUE(prompt_id) 충돌 시 기존 레코드 update
     */
    private void saveOrUpdateAnswer(AnalyticsPrompt prompt, Brand brand, Project project,
                                    boolean ok, double elapsedSec, JsonNode responseJson) {
        AnalyticsAiAnswer existing = answerRepository.findByPrompt(prompt).orElse(null);

        String jsonString = responseJson != null ? responseJson.toString() : "{}";

        if (existing != null) {
            // 기존 레코드 업데이트
            existing = AnalyticsAiAnswer.builder()
                    .id(existing.getId())
                    .prompt(prompt)
                    .brand(brand)
                    .project(project)
                    .ok(ok)
                    .elapsedSec(elapsedSec)
                    .responseJson(jsonString)
                    .build();
            answerRepository.save(existing);
            log.info("[AiInsightServiceImpl] answer updated answerId={}", existing.getId());
        } else {
            // 새 레코드 생성
            AnalyticsAiAnswer answer = AnalyticsAiAnswer.builder()
                    .prompt(prompt)
                    .brand(brand)
                    .project(project)
                    .ok(ok)
                    .elapsedSec(elapsedSec)
                    .responseJson(jsonString)
                    .build();
            answerRepository.save(answer);
            log.info("[AiInsightServiceImpl] answer saved answerId={}", answer.getId());
        }
    }

    private AnalyticsPrompt updatePromptStatus(AnalyticsPrompt prompt, PromptStatus status) {
        // JPA 엔티티는 변경 감지로 자동 업데이트되지만, 명시적으로 새 객체로 교체
        AnalyticsPrompt updated = AnalyticsPrompt.builder()
                .id(prompt.getId())
                .brand(prompt.getBrand())
                .project(prompt.getProject())
                .member(prompt.getMember())
                .question(prompt.getQuestion())
                .topK(prompt.getTopK())
                .status(status)
                .build();
        return promptRepository.save(updated);
    }

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
}

