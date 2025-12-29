package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PythonRagClient {

    // ============================================================
    // [기능] Python(FastAPI) /rag/ask 호출
    // - traceId는 Header(X-Trace-Id)로만 전파 (Python 미들웨어가 처리)
    // - body는 Python RagAskRequest 계약(question, brandId, topK)만 전송
    // - timeout은 Python Ollama timeout(600s)에 맞춰 650s 권장
    // ============================================================

    private final WebClient.Builder webClientBuilder;

    @Value("${python.rag.base-url:http://localhost:8000}")
    private String pythonBaseUrl;

    @Value("${python.rag.timeout-sec:650}")
    private long timeoutSec;

    public JsonNode ask(AiAskRequestDTO req, String traceId) {
        int topK = (req.getTopK() == null) ? 5 : req.getTopK();

        // ✅ Python 계약에 맞는 body만 전송
        Map<String, Object> body = new HashMap<>();
        body.put("brandId", req.getBrandId());
        body.put("question", req.getQuestion());
        body.put("topK", topK);

        log.info("[PythonRagClient] call POST /rag/ask traceId={} baseUrl={} brandId={} topK={} timeoutSec={}",
                traceId, pythonBaseUrl, req.getBrandId(), topK, timeoutSec);

        return webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("/rag/ask")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Trace-Id", traceId) // ✅ 여기로만 전파
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .block();
    }
}
