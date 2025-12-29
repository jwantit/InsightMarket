package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInsightService {

    // ============================================================
    // [기능] AI Insight 서비스 (운영 안정화)
    // - Python 호출 실패/지연 시에도 ok=false 고정 계약으로 응답
    // ============================================================

    private final PythonRagClient pythonRagClient;
    private final ObjectMapper objectMapper = new ObjectMapper(); // 최소 변경(Bean 주입도 가능)

    public JsonNode ask(AiAskRequestDTO req, String traceId) {
        long start = System.currentTimeMillis();

        try {
            log.info("[AiInsightService] ask start traceId={} brandId={}", traceId, req.getBrandId());
            JsonNode res = pythonRagClient.ask(req, traceId);
            log.info("[AiInsightService] ask end traceId={} responseOk={}", traceId, res != null);
            return res;

        } catch (Exception e) {
            long elapsedMs = System.currentTimeMillis() - start;

            // ✅ 운영용 요약 reason
            String reason = summarizeReason(e);

            log.error("[AiInsightService] ask fail traceId={} elapsedMs={} reason={} ex={}",
                    traceId, elapsedMs, reason, e.toString());

            return buildFailResponse(traceId, elapsedMs, reason);
        }
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
