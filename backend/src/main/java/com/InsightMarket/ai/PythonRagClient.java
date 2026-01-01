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


    //스케줄러 - 데이터 수집 요청 -------------------------------------------------------
    public void collect(String type, Long id, String keyword, Long brandId, String brandName) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", type);      // "BRAND", "PROJECT", "COMPETITOR"
        
        String searchKeyword = keyword; // 검색에 사용할 키워드

        if ("BRAND".equals(type)) {
            body.put("brandId", id);
            body.put("brandName", keyword); // 브랜드명
            searchKeyword = keyword; // 브랜드명 그대로 사용
        } else if ("PROJECT".equals(type)) {
            body.put("projectKeywordId", id);
            body.put("brandId", brandId);
            body.put("brandName", brandName);
            // 브랜드명 + 프로젝트 키워드 조합
            searchKeyword = brandName + " " + keyword;
        } else if ("COMPETITOR".equals(type)) {
            body.put("competitorId", id);
            body.put("brandId", brandId);
            searchKeyword = keyword; // 경쟁사명 그대로 사용
        }
        
        body.put("keyword", searchKeyword); // 실제 검색에 사용할 키워드

        log.info("[PythonRagClient] 수집 요청 전송 -> 분류: {}, ID: {}, 검색어: {}", type, id, searchKeyword);

        webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("api/collect")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .subscribe(
                        response -> log.info("[Python] 수집 요청 응답 성공: {}", response),
                        error -> log.error("[Python] 수집 요청 실패: {}", error.getMessage())
                );
    }
    //-----------------------------
}
