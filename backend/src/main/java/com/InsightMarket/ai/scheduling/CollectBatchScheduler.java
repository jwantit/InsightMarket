package com.InsightMarket.ai.scheduling;

import com.InsightMarket.ai.PythonRagClient;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CollectBatchScheduler {

    private final BrandRepository brandRepository;
    private final ProjectKeywordRepository projectKeywordRepository;
    private final PythonRagClient pythonRagClient;

    // 12초마다 실행 (테스트용)
    @Scheduled(fixedRate = 100000)
    public void runDailyCollectionBatch() {
        try {
            log.info("=== 배치 수집 스케줄러 시작 ===");


            List<BrandIdNameDTO> allBrands = brandRepository.findAllBrandIdAndName();
            for (BrandIdNameDTO brand : allBrands) {
                // "BRAND" 타입으로 파이썬에 명령 하달
                pythonRagClient.collect("BRAND", brand.getBrandId(), brand.getBrandName());
                Thread.sleep(1000); // 1초 간격 (유튜브 API 할당량 및 서버 부하 고려)
            }

            List<ProjectKeywordIdNameDTO> allProjectKeyword = projectKeywordRepository.findAllProjectKeywordIdAndKeywordName();
            for (ProjectKeywordIdNameDTO projectKeyword : allProjectKeyword) {
                // 내부적으로 body.put("projectKeywordId", id) 가 작동하여 파이썬 DB 적재가 쉬워짐
                pythonRagClient.collect("PROJECT", projectKeyword.getProjectKeywordId(), projectKeyword.getProjectKeywordName());
                // 파이썬 서버 및 유튜브 API 할당량을 위해 약간의 간격 유지
                Thread.sleep(500);
            }

            log.info("=== 배치 수집 스케줄러 종료 ===");

        } catch (InterruptedException e) {
            log.error("스케줄러 작업 중 인터럽트 발생: {}", e.getMessage());
            Thread.currentThread().interrupt(); // 인터럽트 상태 복구
        }
    }
}