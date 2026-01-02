package com.InsightMarket.ai.scheduling;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
public class AnalyticsProcessingController {

    private final AnalyticsProcessingService analyticsProcessingService;

    @PostMapping("/process")
    public ResponseEntity<JsonNode> process(
            @RequestBody AnalyzeRequestDTO request,
            HttpServletRequest httpRequest
    ) {
        // TraceIdFilter에서 설정한 attribute에서 traceId 읽기
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown";
        }

        log.info("[AnalyticsProcessingController] POST /api/analytics/process traceId={} filePath={} brandId={}",
                traceId, request.getFilePath(), request.getBrandId());

        JsonNode result = analyticsProcessingService.processAnalysis(
                request.getFilePath(),
                request.getBrandId(),
                traceId
        );

        return ResponseEntity.ok(result);
    }
}

