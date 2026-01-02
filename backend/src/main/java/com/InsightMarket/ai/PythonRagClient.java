package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

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


    //분석 파이프라인 요청 -------------------------------------------------------
    public JsonNode analyze(String filePath, Long brandId, String traceId) {
        Map<String, Object> body = new HashMap<>();
        body.put("file_path", filePath != null ? filePath : "raw_data/raw_data.json");
        if (brandId != null) {
            body.put("brand_id", brandId);
        }

        // 요청 body 크기 계산
        try {
            String requestBodyJson = objectMapper.writeValueAsString(body);
            int requestSizeBytes = requestBodyJson.getBytes("UTF-8").length;
            log.info("[PythonRagClient] call POST /api/analyze traceId={} baseUrl={} filePath={} brandId={} timeoutSec={} requestSize={} bytes ({} KB)",
                    traceId, pythonBaseUrl, filePath, brandId, timeoutSec, requestSizeBytes, requestSizeBytes / 1024.0);
        } catch (Exception e) {
            log.warn("[PythonRagClient] 요청 body 크기 계산 실패: {}", e.getMessage());
        }

        // 큰 JSON 응답을 처리하기 위해 maxInMemorySize 설정 (10MB)
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        JsonNode response = webClientBuilder
                .baseUrl(pythonBaseUrl)
                .exchangeStrategies(strategies)
                .build()
                .post()
                .uri("/api/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Trace-Id", traceId)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .block();

        // 응답 크기 계산
        if (response != null) {
            try {
                String responseJson = objectMapper.writeValueAsString(response);
                int responseSizeBytes = responseJson.getBytes("UTF-8").length;
                log.info("[PythonRagClient] analyze 응답 수신 완료 traceId={} responseSize={} bytes ({} KB / {} MB)",
                        traceId, responseSizeBytes, responseSizeBytes / 1024.0, responseSizeBytes / (1024.0 * 1024.0));
            } catch (Exception e) {
                log.warn("[PythonRagClient] 응답 크기 계산 실패: {}", e.getMessage());
            }
        }

        return response;
    }

    //스케줄러 - 데이터 수집 요청 -------------------------------------------------------
    public void collect(String type, Long id, String keyword, Long brandId, String brandName) {
        collect(type, id, keyword, brandId, brandName, false);
    }
    
    public void collect(String type, Long id, String keyword, Long brandId, String brandName, boolean isBatch) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", type);      // "BRAND", "PROJECT", "COMPETITOR"
        body.put("isBatch", isBatch); // 배치 모드 플래그
        
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

        log.info("[PythonRagClient] 수집 요청 전송 -> 분류: {}, ID: {}, 검색어: {}, isBatch: {}", type, id, searchKeyword, isBatch);

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
    
    public void batchStart() {
        log.info("[PythonRagClient] 배치 시작 요청");
        webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("api/collect/batch-start")
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .subscribe(
                        response -> log.info("[Python] 배치 시작 응답: {}", response),
                        error -> log.error("[Python] 배치 시작 실패: {}", error.getMessage())
                );
    }
    
    public JsonNode batchComplete() {
        log.info("[PythonRagClient] 배치 완료 요청");
        return webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("api/collect/batch-complete")
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .block();
    }
    
    public void recollect(String type, Long id, String name, Long brandId, String brandName) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", type);
        body.put("brandId", brandId);
        body.put("brandName", brandName);
        
        if ("BRAND".equals(type)) {
            // BRAND type: id and name are brandId and brandName
            body.put("keyword", name);
        } else if ("PROJECT".equals(type)) {
            body.put("projectKeywordId", id);
            body.put("projectKeywordName", name);
            body.put("keyword", brandName + " " + name);
        } else if ("COMPETITOR".equals(type)) {
            body.put("competitorId", id);
            body.put("competitorName", name);
            body.put("keyword", name);
        }
        
        log.info("[PythonRagClient] 재수집 요청 -> 분류: {}, ID: {}, 이름: {}", type, id, name);
        
        webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("api/collect/recollect")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .subscribe(
                        response -> log.info("[Python] 재수집 응답: {}", response),
                        error -> log.error("[Python] 재수집 실패: {}", error.getMessage())
                );
    }
    //-----------------------------
    
    // 전략 분석 요청 -------------------------------------------------------
    public JsonNode askStrategy(String question, Long brandId, String brandName, List<Long> projectKeywordIds, Integer topK, String traceId) {
        int topKValue = (topK == null) ? 5 : topK;
        
        Map<String, Object> body = new HashMap<>();
        body.put("question", question);
        body.put("brandId", brandId);
        body.put("brandName", brandName);
        body.put("projectKeywordIds", projectKeywordIds != null ? projectKeywordIds : List.of());
        body.put("topK", topKValue);
        
        log.info("[PythonRagClient] call POST /rag/ask-strategy traceId={} baseUrl={} brandId={} brandName={} projectKeywordIds={} topK={} timeoutSec={}",
                traceId, pythonBaseUrl, brandId, brandName, projectKeywordIds, topKValue, timeoutSec);
        
        return webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("/rag/ask-strategy")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Trace-Id", traceId)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .block();
    }
}
