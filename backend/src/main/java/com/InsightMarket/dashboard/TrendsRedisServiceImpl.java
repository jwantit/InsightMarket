package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.PythonTrendResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TrendsRedisServiceImpl implements TrendsRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_KEY_PREFIX = "brand:trend:";


//  Redis에 데이터를 저장하며 10분의 유효기간을 설정
//  5분마다 갱신되므로 10분은 데이터 정합성을 유지하기에 충분한 시간임
    @Override
    public void saveTrendData(Long brandId, PythonTrendResponseDTO data) {
        String key = CACHE_KEY_PREFIX + brandId;
        redisTemplate.opsForValue().set(key, data, 10, TimeUnit.MINUTES);
    }

//  캐시된 데이터를 반환하여 Python 서버의 부하를 줄이고 응답 속도를 높임
    @Override
    public PythonTrendResponseDTO getTrendData(Long brandId) {
        String key = CACHE_KEY_PREFIX + brandId;
        return (PythonTrendResponseDTO) redisTemplate.opsForValue().get(key);
    }
}