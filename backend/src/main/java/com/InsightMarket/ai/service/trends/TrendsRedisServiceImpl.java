package com.InsightMarket.ai.service.trends;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendsRedisServiceImpl implements TrendsRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_KEY_PREFIX = "brand:trend:";


//  Redis에 데이터를 저장하며 10분의 유효기간을 설정
//  5분마다 갱신되므로 10분은 데이터 정합성을 유지하기에 충분한 시간임
    @Override
    public void saveTrendData(Long brandId, PythonTrendResponseDTO data) {
        try {
            String key = CACHE_KEY_PREFIX + brandId;
            redisTemplate.opsForValue().set(key, data, 60, TimeUnit.MINUTES);
            log.info("Redis 저장 성공 - Key: {}, BrandId: {}", key, brandId);
            
            // 저장 후 확인 (디버깅용)
            Object saved = redisTemplate.opsForValue().get(key);
            log.info("Redis 저장 확인 - Key: {}, 데이터 존재: {}", key, saved != null);
        } catch (Exception e) {
            log.error("Redis 저장 실패 - BrandId: {}, Error: {}", brandId, e.getMessage(), e);
            throw new RuntimeException("Redis 저장 실패", e);
        }
    }

//  캐시된 데이터를 반환하여 Python 서버의 부하를 줄이고 응답 속도를 높임
    @Override
    public PythonTrendResponseDTO getTrendData(Long brandId) {
        try {
            String key = CACHE_KEY_PREFIX + brandId;
            PythonTrendResponseDTO result = (PythonTrendResponseDTO) redisTemplate.opsForValue().get(key);
            log.debug("Redis 조회 - Key: {}, 데이터 존재: {}", key, result != null);
            return result;
        } catch (Exception e) {
            log.error("Redis 조회 실패 - BrandId: {}, Error: {}", brandId, e.getMessage(), e);
            return null;
        }
    }
}

