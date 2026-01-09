package com.InsightMarket.dashboard;

import com.InsightMarket.repository.brand.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


 //정기적으로 Python API 수집을 트리거하는 스케줄러 클래스
@Component
@RequiredArgsConstructor
public class TrendsPollingScheduler {

    private final TrendsService trendsService;
    private final BrandRepository brandRepository;

    // 5분(300,000ms)마다 DB의 모든 브랜드를 순회하며
    // 최신 구글 연관 검색어 데이터를 수집하도록 요청합니다.
    // 현재 50분
    @Scheduled(fixedRate = 3000000)
    public void updateAllBrandTrends() {
        brandRepository.findAll().forEach(brand -> {
            trendsService.fetchAndSaveTrends(brand.getId(), brand.getName());
        });
    }
}