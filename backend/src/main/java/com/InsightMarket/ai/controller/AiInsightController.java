package com.InsightMarket.ai.controller;

import com.InsightMarket.ai.dto.aiInsight.AiAskRequestDTO;
import com.InsightMarket.ai.dto.aiInsight.SaveReportRequestDTO;
import com.InsightMarket.ai.dto.aiInsight.SolutionReportRequestDTO;
import com.InsightMarket.ai.service.aiInsight.AiInsightService;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.security.util.MemberUtil;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{brandId}/ai")
public class AiInsightController {

    private final AiInsightService aiInsightService;
    private final MemberUtil memberUtil;

    @PostMapping("/ask")
    public ResponseEntity<JsonNode> askAiInsight(
            @PathVariable Long brandId,
            @RequestBody AiAskRequestDTO req,
            HttpServletRequest httpRequest
    ) {
        // TraceIdFilter에서 설정한 attribute에서 traceId 읽기
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown"; // fallback
        }

        // ✅ URL brandId를 DTO에 주입
        req.setBrandId(brandId);

        log.info("[AiInsightController] POST /api/{}/ai/ask traceId={} brandId={} projectId={} questionLen={} topK={}",
                brandId, traceId, brandId, req.getProjectId(), 
                req.getQuestion() != null ? req.getQuestion().length() : 0, req.getTopK());

        JsonNode res = aiInsightService.askAiInsight(req, traceId);

        return ResponseEntity.ok(res);
    }
    
    @PostMapping("/generate-solution-report")
    public ResponseEntity<JsonNode> generateSolutionReport(
            @PathVariable Long brandId,
            @RequestBody SolutionReportRequestDTO req,
            HttpServletRequest httpRequest
    ) {
        // TraceIdFilter에서 설정한 attribute에서 traceId 읽기
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown"; // fallback
        }

        // ✅ 1) URL brandId를 DTO에 주입
        req.setBrandId(brandId);

        log.info("[AiInsightController] POST /api/{}/ai/generate-solution-report traceId={} brandId={} solutionTitle={}",
                brandId, traceId, brandId, req.getSolutionTitle());

        JsonNode res = aiInsightService.generateSolutionReport(req, traceId);

        return ResponseEntity.ok(res);
    }
    
    @PostMapping("/save-report")
    public ResponseEntity<JsonNode> saveReport(
            @PathVariable Long brandId,
            @RequestBody SaveReportRequestDTO req,
            HttpServletRequest httpRequest
    ) {
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown";
        }

        log.info("[AiInsightController] POST /api/{}/ai/save-report traceId={} projectId={} solutionTitle={}",
                brandId, traceId, req.getProjectId(), req.getSolutionTitle());

        JsonNode res = aiInsightService.saveReportAsSolution(req, traceId);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/free-report-count")
    public ResponseEntity<Long> getFreeReportCount(
            @PathVariable Long brandId,
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {
        Long memberId = memberUtil.getCurrentMember().getId();
        long count = aiInsightService.getFreeReportCount(memberId);
        log.info("[AiInsightController] GET /api/{}/ai/free-report-count memberId={} count={}", 
                brandId, memberId, count);
        return ResponseEntity.ok(count);
    }
}

