package com.InsightMarket.controller;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import com.InsightMarket.ai.service.trends.TrendsPerformanceService;
import com.InsightMarket.ai.service.trends.TrendsRedisService;
import com.InsightMarket.dto.dashboard.*;
import com.InsightMarket.service.dashboard.DashBoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashBoardController {

    private final DashBoardService dashBoardService;
     // 추가: Redis 서비스 주입
    private final TrendsRedisService trendsRedisService;
    private final TrendsPerformanceService trendsPerformanceService;


    @GetMapping("/mention/analysis")
    public ResponseEntity<BrandMentionSummaryResponseDTO> getBrandAnalysis(DashBoardRequestDTO requestDTO) {

        log.info("대시보드 분석 요청 시작 - BrandID: {}, Channels: {}",
                requestDTO.getBrandId(), requestDTO.getContentChannel());

        BrandMentionSummaryResponseDTO response = dashBoardService.getBrandDailyAnalysis(requestDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/mention/chart")
    public ResponseEntity<BrandAllChartResponseDTO> getBrandMentionChart(DashBoardRequestDTO requestDTO) {

        log.info("브랜드 언급 차트 조회 요청 - BrandID: {}, Unit: {}, Channels: {}",
                requestDTO.getBrandId(),
                requestDTO.getUnit(), // 일별/주별 구분 로그 추가
                requestDTO.getContentChannel());

        BrandAllChartResponseDTO response = dashBoardService.getBrandMentionChart(requestDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sentiment/analysis")
    public ResponseEntity<BrandSentimentResponseDTO> getBrandSentiment(DashBoardRequestDTO requestDTO) {

        // 서비스 호출 및 결과 반환
        BrandSentimentResponseDTO response = dashBoardService.getBrandSentimentAnalysis(requestDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sentiment/wordcloud")
    public ResponseEntity<BrandWordCloudResponseDTO> getBrandWordcloud(DashBoardRequestDTO requestDTO) {

        // 서비스 호출 및 결과 반환
        BrandWordCloudResponseDTO response = dashBoardService.getBrandWordCloudData(requestDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sentiment/chart")
    public ResponseEntity<BrandAllChartResponseDTO> getBrandSentimentChart(DashBoardRequestDTO requestDTO) {

        // 서비스 호출 및 결과 반환
        BrandAllChartResponseDTO response = dashBoardService.getBrandSentimentChart(requestDTO);

        return ResponseEntity.ok(response);
    }

    // 브랜드별 실시간 구글 연관 검색어 트렌드 조회
    @GetMapping("/trends")
    public ResponseEntity<PythonTrendResponseDTO> getBrandTrends(DashBoardRequestDTO requestDTO) {
        log.info("실시간 트렌드 조회 요청 - BrandID: {}", requestDTO.getBrandId());

        // Redis에서 최신 데이터를 가져옴
        PythonTrendResponseDTO response = trendsRedisService.getTrendData(requestDTO.getBrandId());

        if (response == null) {
            // 아직 데이터가 수집되지 않은 경우 204 No Content 또는 빈 객체 반환
            log.warn("Brand {} 에 대한 트렌드 데이터가 Redis에 없습니다.", requestDTO.getBrandId());
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }

    // DB 조회 vs Redis 조회 성능 비교 테스트
    @GetMapping("/trends/performance")
    public ResponseEntity<String> compareTrendsPerformance(DashBoardRequestDTO requestDTO) {
        log.info("성능 비교 테스트 요청 - BrandID: {}", requestDTO.getBrandId());

        try {
            trendsPerformanceService.comparePerformance(requestDTO.getBrandId());
            return ResponseEntity.ok("성능 비교 완료. 로그를 확인하세요.");
        } catch (Exception e) {
            log.error("성능 비교 테스트 실패 - BrandID: {}", requestDTO.getBrandId(), e);
            return ResponseEntity.internalServerError()
                    .body("성능 비교 테스트 실패: " + e.getMessage());
        }
    }
}

