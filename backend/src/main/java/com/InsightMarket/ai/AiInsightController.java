package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{brandId}/ai")
public class AiInsightController {

    private final AiInsightService aiInsightService;

    @PostMapping("/ask")
    public ResponseEntity<JsonNode> ask(
            @PathVariable Long brandId,
            @RequestBody AiAskRequestDTO req,
            HttpServletRequest httpRequest
    ) {
        // TraceIdFilter에서 설정한 attribute에서 traceId 읽기
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown"; // fallback
        }

        // ✅ 1) URL brandId를 DTO에 주입
        req.setBrandId(brandId);

        // ✅ 2) traceId는 Filter가 보장하므로 여기서 생성하지 않음
        log.info("[AiInsightController] POST /api/{}/ai/ask traceId={} brandId={}",
                brandId, traceId, brandId);

        JsonNode res = aiInsightService.ask(req, traceId);

        // ✅ 3) 응답 헤더 X-Trace-Id도 Filter가 이미 세팅함
        return ResponseEntity.ok(res);
    }
}
