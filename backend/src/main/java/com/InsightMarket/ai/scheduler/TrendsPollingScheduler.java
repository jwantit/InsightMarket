package com.InsightMarket.ai.scheduler;

import com.InsightMarket.ai.service.trends.TrendsService;
import com.InsightMarket.repository.brand.BrandRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


 //정기적으로 Python API 수집을 트리거하는 스케줄러 클래스
@Slf4j
@Component
@RequiredArgsConstructor
public class TrendsPollingScheduler {

    private final TrendsService trendsService;
    private final BrandRepository brandRepository;

     // 서버 시작 시 즉시 실행 (빈 초기화 후)
     @PostConstruct
     public void init() {
         log.info("=== 서버 시작 시 트렌드 데이터 초기 수집 시작 ===");
         updateAllBrandTrends();
         log.info("=== 트렌드 데이터 초기 수집 완료 ===");
     }

    // 10분(600,000ms)마다 DB의 모든 브랜드를 순회하며
    // 최신 구글 연관 검색어 데이터를 수집하도록 요청합니다.
    @Scheduled(fixedRate = 600000)
    public void updateAllBrandTrends() {
        brandRepository.findAll().forEach(brand -> {
            trendsService.fetchAndSaveTrends(brand.getId(), brand.getName());
        });
    }
}

