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

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${python.rag.base-url:http://localhost:8000}")
    private String pythonBaseUrl;

    @Value("${python.rag.timeout-sec:650}")
    private long timeoutSec;


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
        collect(type, id, keyword, brandId, brandName, null, false);
    }
    
    public void collect(String type, Long id, String keyword, Long brandId, String brandName, boolean isBatch) {
        collect(type, id, keyword, brandId, brandName, null, isBatch);
    }
    
    public void collect(String type, Long id, String keyword, Long brandId, String brandName, Long projectId, boolean isBatch) {
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
            if (projectId != null) {
                body.put("projectId", projectId);
            }
            // 브랜드명 + 프로젝트 키워드 조합
            searchKeyword = brandName + " " + keyword;
        } else if ("COMPETITOR".equals(type)) {
            body.put("competitorId", id);
            body.put("brandId", brandId);
            searchKeyword = keyword; // 경쟁사명 그대로 사용
        }
        
        body.put("keyword", searchKeyword); // 실제 검색에 사용할 키워드

        log.info("[PythonRagClient] 수집 요청 전송 -> 분류: {}, ID: {}, 검색어: {}, projectId: {}, isBatch: {}", type, id, searchKeyword, projectId, isBatch);

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
        recollect(type, id, name, brandId, brandName, null);
    }
    
    public void recollect(String type, Long id, String name, Long brandId, String brandName, Long projectId) {
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
            if (projectId != null) {
                body.put("projectId", projectId);
            }
            body.put("keyword", brandName + " " + name);
        } else if ("COMPETITOR".equals(type)) {
            body.put("competitorId", id);
            body.put("competitorName", name);
            body.put("keyword", name);
        }
        
        log.info("[PythonRagClient] 재수집 요청 -> 분류: {}, ID: {}, 이름: {}, projectId: {}", type, id, name, projectId);
        
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
    
    // 전략 분석 요청 (Query Engineering 방식) -------------------------------------------------------
    public JsonNode askStrategy(String question, Long brandId, String brandName, Long projectId, List<Long> projectKeywordIds, Integer topK, String traceId) {
        int topKValue = (topK == null) ? 3 : topK;
        
        Map<String, Object> body = new HashMap<>();
        body.put("question", question);
        body.put("brandId", brandId);
        body.put("brandName", brandName);
        body.put("projectId", projectId); // 프로젝트 ID 추가
        body.put("projectKeywordIds", projectKeywordIds != null ? projectKeywordIds : List.of());
        body.put("topK", topKValue);
        
        log.info("[PythonRagClient] call POST /api/strategy/ask-strategy traceId={} baseUrl={} brandId={} projectId={} brandName={} projectKeywordIds={} topK={} timeoutSec={}",
                traceId, pythonBaseUrl, brandId, projectId, brandName, projectKeywordIds, topKValue, timeoutSec);
        
        return webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("/api/strategy/ask-strategy")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("X-Trace-Id", traceId)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(timeoutSec))
                .block();
    }
    
    // 솔루션별 리포트 생성 요청 -------------------------------------------------------
    public JsonNode generateSolutionReport(SolutionReportRequestDTO req, String traceId) {
        Map<String, Object> body = new HashMap<>();
        body.put("brandId", req.getBrandId());
        body.put("brandName", req.getBrandName());
        body.put("projectId", req.getProjectId());
        body.put("projectName", req.getProjectName() != null ? req.getProjectName() : "");
        body.put("question", req.getQuestion());
        body.put("solutionTitle", req.getSolutionTitle());
        body.put("solutionDescription", req.getSolutionDescription() != null ? req.getSolutionDescription() : "");
        body.put("relatedProblems", req.getRelatedProblems() != null ? req.getRelatedProblems() : List.of());
        body.put("relatedInsights", req.getRelatedInsights() != null ? req.getRelatedInsights() : List.of());
        body.put("keywordStatsSummary", req.getKeywordStatsSummary() != null ? req.getKeywordStatsSummary() : "");
        body.put("reportType", req.getReportType() != null ? req.getReportType() : "marketing");
        
        log.info("[PythonRagClient] call POST /api/strategy/generate-solution-report traceId={} baseUrl={} brandId={} projectId={} solutionTitle={} reportType={} timeoutSec={}",
                traceId, pythonBaseUrl, req.getBrandId(), req.getProjectId(), req.getSolutionTitle(), req.getReportType(), timeoutSec);
        
        return webClientBuilder
                .baseUrl(pythonBaseUrl)
                .build()
                .post()
                .uri("/api/strategy/generate-solution-report")
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
