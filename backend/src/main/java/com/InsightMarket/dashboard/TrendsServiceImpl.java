package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.PythonTrendResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendsServiceImpl implements TrendsService {

    private final WebClient.Builder webClientBuilder;
    private final TrendsRedisService trendsRedisService;

    /**
     * WebClient를 사용하여 비동기로 Python 서버에 데이터를 요청합니다.
     * 규격: POST http://localhost:8000/api/trends/generate-related
     * 바디: { "brandId": 1, "brandName": "아이폰" }
     */
    @Override
    public void fetchAndSaveTrends(Long brandId, String keyword) {
        String pythonUrl = "http://localhost:8000/api/trends/generate-related";

        // 파이썬이 기대하는 JSON 바디 데이터 구성
        Map<String, Object> bodyMap = new HashMap<>();
        bodyMap.put("brandId", brandId);
        bodyMap.put("brandName", keyword);

        log.info("Python 트렌드 수집 요청 시작 - Brand: {}, Keyword: {}", brandId, keyword);

        webClientBuilder.build()
                .post()
                .uri(pythonUrl)
                .bodyValue(bodyMap)
                .retrieve()
                .bodyToMono(PythonTrendResponseDTO.class)
                .subscribe(data -> {
                    if (data != null && data.getData() != null) {
                        trendsRedisService.saveTrendData(brandId, data);
                        log.info("브랜드 {} 트렌드 데이터 Redis 저장 성공", brandId);
                    }
                }, error -> {
                    log.error("파이썬 호출 실패 (브랜드 {}): {}", brandId, error.getMessage());
                });
    }
}