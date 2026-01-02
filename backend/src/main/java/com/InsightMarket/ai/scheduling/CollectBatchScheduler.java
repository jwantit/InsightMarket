package com.InsightMarket.ai.scheduling;

import com.InsightMarket.ai.PythonRagClient;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.competitor.CompetitorRepository;
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
    private final CompetitorRepository competitorRepository;
    private final PythonRagClient pythonRagClient;


    // Cron 표현식 설명
    // 0 0 0 * * ? = 초(0) 분(0) 시(0) 일() 월() 요일(?)
    // 매일 낮 12시에 실행
    @Scheduled(cron = "0 30 14 * * ?")
    public void runDailyCollectionBatch() {
        try {
            log.info("=== 배치 수집 스케줄러 시작 ===");
            
            // 배치 시작
            pythonRagClient.batchStart();
            Thread.sleep(1000); // 배치 시작이 완료될 시간

            List<BrandIdNameDTO> allBrands = brandRepository.findAllBrandIdAndName();
            for (BrandIdNameDTO brand : allBrands) {
                // "BRAND" 타입으로 파이썬에 명령 하달 (배치 모드)
                pythonRagClient.collect("BRAND", brand.getBrandId(), brand.getBrandName(), brand.getBrandId(), brand.getBrandName(), true);
                Thread.sleep(1000); // 1초 간격 (유튜브 API 할당량 및 서버 부하 고려)
            }

            List<ProjectKeywordIdNameDTO> allProjectKeyword = projectKeywordRepository.findAllProjectKeywordIdAndKeywordName();
            for (ProjectKeywordIdNameDTO projectKeyword : allProjectKeyword) {
                // 브랜드명과 프로젝트 키워드를 함께 전달하여 Python에서 조합 (배치 모드)
                pythonRagClient.collect(
                        "PROJECT",
                        projectKeyword.getProjectKeywordId(),
                        projectKeyword.getProjectKeywordName(),
                        projectKeyword.getBrandId(),
                        projectKeyword.getBrandName(),
                        true
                );
                // 파이썬 서버 및 유튜브 API 할당량을 위해 약간의 간격 유지
                Thread.sleep(500);
            }

            // 경쟁사 수집 (활성화된 경쟁사만, 배치 모드)
            List<CompetitorIdNameDTO> allCompetitors = competitorRepository.findAllCompetitorIdAndName();
            for (CompetitorIdNameDTO competitor : allCompetitors) {
                pythonRagClient.collect(
                        "COMPETITOR",
                        competitor.getCompetitorId(),
                        competitor.getCompetitorName(),
                        competitor.getBrandId(),
                        null, // 경쟁사는 브랜드명 불필요
                        true
                );
                Thread.sleep(500);
            }
            
            // 모든 수집 요청이 처리될 시간을 고려하여 대기
            Thread.sleep(2000);
            
            // 배치 완료
            pythonRagClient.batchComplete();

            log.info("=== 배치 수집 스케줄러 종료 ===");

        } catch (InterruptedException e) {
            log.error("스케줄러 작업 중 인터럽트 발생: {}", e.getMessage());
            Thread.currentThread().interrupt(); // 인터럽트 상태 복구
        }
    }
}