package com.InsightMarket.ai.service.trends;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class TrendsPerformanceServiceImpl implements TrendsPerformanceService {

    private final TrendsDbService trendsDbService;
    private final TrendsRedisService trendsRedisService;
    
    private static final int ITERATION_COUNT = 10; // 반복 측정 횟수

    @Override
    public void comparePerformance(Long brandId) {
        log.info("========== [성능 비교 시작] Brand ID: {} ==========", brandId);

        // DB 조회 시간 측정
        List<Long> dbTimes = new ArrayList<>();
        for (int i = 0; i < ITERATION_COUNT; i++) {
            long startTime = System.nanoTime();
            trendsDbService.getTrendData(brandId);
            long endTime = System.nanoTime();
            long elapsedTime = (endTime - startTime) / 1_000_000; // 나노초를 밀리초로 변환
            dbTimes.add(elapsedTime);
        }

        // Redis 조회 시간 측정
        List<Long> redisTimes = new ArrayList<>();
        for (int i = 0; i < ITERATION_COUNT; i++) {
            long startTime = System.nanoTime();
            trendsRedisService.getTrendData(brandId);
            long endTime = System.nanoTime();
            long elapsedTime = (endTime - startTime) / 1_000_000; // 나노초를 밀리초로 변환
            redisTimes.add(elapsedTime);
        }

        // 평균 계산
        double dbAvgTime = dbTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
        double redisAvgTime = redisTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);

        // 성능 개선 배수 계산 (Redis가 DB보다 몇 배 빠른지)
        double speedup = 0.0;
        if (redisAvgTime > 0) {
            speedup = dbAvgTime / redisAvgTime;
        }

        // 결과 로그 출력
        log.info("========== [성능 비교 결과] Brand ID: {} ==========", brandId);
        log.info("DB 조회 평균 시간: {}ms", String.format("%.2f", dbAvgTime));
        log.info("Redis 조회 평균 시간: {}ms", String.format("%.2f", redisAvgTime));
        log.info("성능 개선 배수: {}배 (Redis가 DB보다 빠름)", String.format("%.2f", speedup));
        log.info("====================================================");
    }
}

