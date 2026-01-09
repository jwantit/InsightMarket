package com.InsightMarket.service;

import com.InsightMarket.dashboard.TrendsRedisService;
import com.InsightMarket.dashboard.TrendsService;
import com.InsightMarket.dashboard.dto.PythonTrendResponseDTO;
import com.InsightMarket.dashboard.dto.TrendItemDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@SpringBootTest
public class TrendsServiceTests {

    @Autowired
    private TrendsRedisService trendsRedisService;

    @Autowired
    private TrendsService trendsService;

    @Test
    @DisplayName("Redis 저장 및 조회 통합 테스트")
    public void testRedisSaveAndGet() {
        // 1. Given: 테스트 데이터 준비
        Long brandId = 1L; // 테스트용 임시 ID
        
        List<TrendItemDTO> topItems = List.of(
                new TrendItemDTO("아이폰 17", "100"),
                new TrendItemDTO("아이폰 16", "37")
        );
        
        List<TrendItemDTO> risingItems = List.of(
                new TrendItemDTO("아이폰 알람 소리 안남", "180"),
                new TrendItemDTO("아이폰 17e", "110")
        );

        PythonTrendResponseDTO.TrendData trendData = new PythonTrendResponseDTO.TrendData();
        trendData.setTop(topItems);
        trendData.setRising(risingItems);

        PythonTrendResponseDTO dto = PythonTrendResponseDTO.builder()
                .keyword("아이폰")
                .brandId(brandId)
                .collectedAt("2026-01-09 13:43:41")
                .data(trendData)
                .build();

        // 2. When: Redis에 저장
        trendsRedisService.saveTrendData(brandId, dto);

        // 3. Then: Redis에서 다시 꺼내서 검증
        PythonTrendResponseDTO savedData = trendsRedisService.getTrendData(brandId);

        assertNotNull(savedData, "저장된 데이터가 null이 아니어야 합니다.");
        assertEquals(brandId, savedData.getBrandId(), "브랜드 ID가 일치해야 합니다.");
        assertEquals("아이폰", savedData.getKeyword(), "키워드가 일치해야 합니다.");
        assertEquals(2, savedData.getData().getTop().size(), "인기 검색어 개수가 일치해야 합니다.");
        assertEquals("아이폰 17", savedData.getData().getTop().get(0).getQuery(), "첫 번째 인기 검색어가 일치해야 합니다.");
        assertEquals("180", savedData.getData().getRising().get(0).getValue(), "첫 번째 급상승 검색어의 값이 일치해야 합니다.");

        log.info("Redis 저장 및 조회 성공: {}", savedData);
    }

    @Test
    @DisplayName("Python API 호출 비동기 테스트 (Mocking 없이 실제 호출 시도)")
    public void testFetchAndSaveTrends() {
        // 이 테스트는 파이썬 서버가 켜져 있어야 성공합니다.
        // 현재는 호출이 에러 없이 전송되는지만 로그로 확인합니다.
        Long brandId = 1L;

        assertDoesNotThrow(() -> {
            trendsService.fetchAndSaveTrends(brandId, "아이폰");
        });

        log.info("비동기 호출 완료 (로그의 결과를 확인하세요)");
    }
}