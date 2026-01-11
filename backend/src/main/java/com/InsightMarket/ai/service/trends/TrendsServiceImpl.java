package com.InsightMarket.ai.service.trends;

import com.InsightMarket.ai.PythonClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendsServiceImpl implements TrendsService {

    private final PythonClient pythonClient;
    private final TrendsRedisService trendsRedisService;
    private final TrendsDbService trendsDbService;

    /**
     * PythonRagClient를 사용하여 비동기로 Python 서버에 트렌드 데이터를 요청합니다.
     * 규격: POST http://localhost:8000/api/trends/generate-related
     * 바디: { "brandId": 1, "brandName": "아이폰" }
     */
    @Override
    public void fetchAndSaveTrends(Long brandId, String keyword) {
        log.info("Python 트렌드 수집 요청 시작 - Brand: {}, Keyword: {}", brandId, keyword);

        pythonClient.generateTrends(
                brandId,
                keyword,
                data -> {
                    log.info("Python API 응답 수신 - Brand: {}, Data 존재: {}", brandId, data != null);
                    
                    // 성공 콜백
                    if (data != null && data.getData() != null) {
                        log.info("데이터 상세 - Keyword: {}, CollectedAt: {}", data.getKeyword(), data.getCollectedAt());
                        
                        // Redis에 저장
                        try {
                            trendsRedisService.saveTrendData(brandId, data);
                            log.info("브랜드 {} 트렌드 데이터 Redis 저장 성공", brandId);
                        } catch (Exception e) {
                            log.error("브랜드 {} 트렌드 데이터 Redis 저장 실패: {}", brandId, e.getMessage(), e);
                        }
                        
                        // DB에 저장
                        try {
                            trendsDbService.saveTrendData(brandId, data);
                            log.info("브랜드 {} 트렌드 데이터 DB 저장 성공", brandId);
                        } catch (Exception e) {
                            log.error("브랜드 {} 트렌드 데이터 DB 저장 실패: {}", brandId, e.getMessage(), e);
                        }
                    } else {
                        log.warn("브랜드 {} 트렌드 데이터가 null이거나 data 필드가 없습니다.", brandId);
                    }
                },
                error -> {
                    // 에러 콜백
                    log.error("파이썬 호출 실패 (브랜드 {}): {}", brandId, error.getMessage(), error);
                }
        );
    }
}

