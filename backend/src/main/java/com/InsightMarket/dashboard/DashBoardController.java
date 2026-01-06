package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.*;
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




}