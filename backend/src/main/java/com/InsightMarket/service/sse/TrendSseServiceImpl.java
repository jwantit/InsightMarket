package com.InsightMarket.service.sse;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import com.InsightMarket.ai.service.trends.TrendsRedisService;
import com.InsightMarket.common.event.TrendDataUpdatedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 트렌드 데이터 SSE(Server-Sent Events) 연결을 관리하는 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrendSseServiceImpl implements TrendSseService {

    // 브랜드별 SSE 연결 목록 관리 (브랜드 ID -> SseEmitter 리스트)
    private final ConcurrentHashMap<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    
    // ObjectMapper 빈 주입 (JacksonAutoConfiguration에서 제공)
    private final ObjectMapper objectMapper;
    
    // Redis 서비스 주입 (초기 데이터 조회용)
    private final TrendsRedisService trendsRedisService;
    
    // SSE 연결 타임아웃 (1시간)
    private static final long SSE_TIMEOUT = 3600000L;
    
    // SSE 이벤트 이름 상수
    private static final String EVENT_CONNECTED = "connected";
    private static final String EVENT_INITIAL_DATA = "initial-data";
    private static final String EVENT_TREND_UPDATE = "trend-update";
    private static final String EVENT_ERROR = "error";
    private static final String EVENT_CONNECTION_COUNT = "connection-count";

    /**
     * JSON 변환 헬퍼 메서드
     */
    private String toJson(Object data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("[SSE] JSON 변환 실패", e);
            throw new RuntimeException("JSON 변환 실패", e);
        }
    }

    /**
     * 모든 연결에게 이벤트를 브로드캐스트하는 공통 메서드
     */
    private void broadcastEvent(Long brandId, String eventName, String data) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        if (emitterList == null || emitterList.isEmpty()) {
            return;
        }
        
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitterList) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                log.warn("[SSE] 브랜드 {} 이벤트 전송 실패: {}", brandId, eventName);
                deadEmitters.add(emitter);
            }
        }
        
        // 끊어진 연결 제거
        for (SseEmitter deadEmitter : deadEmitters) {
            removeEmitter(brandId, deadEmitter);
        }
    }

    /**
     * 특정 브랜드의 모든 연결에게 연결 수를 브로드캐스트합니다.
     * 
     * @param brandId 브랜드 ID
     */
    private void broadcastConnectionCount(Long brandId) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        if (emitterList == null || emitterList.isEmpty()) {
            return;
        }
        
        int connectionCount = emitterList.size();
        String connectionCountJson = toJson(Map.of("connectionCount", connectionCount, "brandId", brandId));
        broadcastEvent(brandId, EVENT_CONNECTION_COUNT, connectionCountJson);
    }

    @Override
    public SseEmitter subscribe(Long brandId) {
        log.info("[SSE] 브랜드 {} SSE 연결 요청", brandId);
        
        // SSE Emitter 생성 (타임아웃 1시간)
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        // 브랜드별 emitter 리스트에 추가
        emitters.computeIfAbsent(brandId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        log.info("[SSE] 브랜드 {} SSE 연결 등록 완료. 현재 연결 수: {}", 
                brandId, emitters.get(brandId).size());
        
        // 연결 완료 시 처리
        emitter.onCompletion(() -> {
            log.info("[SSE] 브랜드 {} SSE 연결 완료 (정상 종료)", brandId);
            removeEmitter(brandId, emitter);
        });
        
        // 타임아웃 시 처리
        emitter.onTimeout(() -> {
            log.warn("[SSE] 브랜드 {} SSE 연결 타임아웃", brandId);
            emitter.complete();
            removeEmitter(brandId, emitter);
        });
        
        // 에러 발생 시 처리
        emitter.onError((ex) -> {
            log.error("[SSE] 브랜드 {} SSE 연결 에러: {}", brandId, ex.getMessage());
            removeEmitter(brandId, emitter);
        });
        
        // 초기 연결 확인 메시지 전송
        try {
            emitter.send(SseEmitter.event()
                    .name(EVENT_CONNECTED)
                    .data("SSE 연결이 성공적으로 설정되었습니다."));
        } catch (IOException e) {
            log.error("[SSE] 브랜드 {} 초기 메시지 전송 실패", brandId, e);
            removeEmitter(brandId, emitter);
            return emitter;
        }
        
        // 모든 연결에게 연결 수 브로드캐스트 (새로 연결된 클라이언트 포함)
        broadcastConnectionCount(brandId);
        
        return emitter;
    }
    
    /**
     * 브랜드별 트렌드 데이터 SSE 연결을 생성하고 등록하며 초기 데이터를 전송합니다.
     * 
     * @param brandId 브랜드 ID
     * @return SseEmitter SSE 연결 객체
     */
    public SseEmitter subscribeWithInitialData(Long brandId) {
        log.info("[SSE] 브랜드 {} SSE 연결 요청 (초기 데이터 포함)", brandId);
        
        // SSE 연결 생성 및 등록
        SseEmitter emitter = subscribe(brandId);
        
        // 초기 데이터 전송 (Redis에서 최신 데이터 조회)
        PythonTrendResponseDTO initialData = trendsRedisService.getTrendData(brandId);
        if (initialData != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(EVENT_INITIAL_DATA)
                        .data(initialData));
                log.info("[SSE] 브랜드 {} 초기 데이터 전송 완료", brandId);
            } catch (IOException e) {
                log.error("[SSE] 브랜드 {} 초기 데이터 전송 실패", brandId, e);
            }
        } else {
            log.warn("[SSE] 브랜드 {} 초기 데이터 없음 (Redis에 데이터 없음)", brandId);
        }
        
        return emitter;
    }

    @Override
    public void broadcast(Long brandId, PythonTrendResponseDTO data) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        
        if (emitterList == null || emitterList.isEmpty()) {
            log.debug("[SSE] 브랜드 {}에 연결된 클라이언트가 없습니다.", brandId);
            return;
        }
        
        log.info("[SSE] 브랜드 {} 트렌드 데이터 브로드캐스트 시작. 연결 수: {}", 
                brandId, emitterList.size());
        
        String jsonData = toJson(data);
        int beforeSize = emitterList.size();
        broadcastEvent(brandId, EVENT_TREND_UPDATE, jsonData);
        
        int afterSize = emitters.get(brandId) != null ? emitters.get(brandId).size() : 0;
        log.info("[SSE] 브랜드 {} 트렌드 데이터 브로드캐스트 완료. 성공: {}, 실패: {}", 
                brandId, afterSize, beforeSize - afterSize);
    }

    @Override
    public void removeEmitter(Long brandId, SseEmitter emitter) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        
        if (emitterList != null) {
            emitterList.remove(emitter);
            int remainingCount = emitterList.size();
            log.info("[SSE] 브랜드 {} SSE 연결 제거. 남은 연결 수: {}", 
                    brandId, remainingCount);
            
            // 리스트가 비어있으면 맵에서도 제거
            if (emitterList.isEmpty()) {
                emitters.remove(brandId);
                log.info("[SSE] 브랜드 {} 모든 SSE 연결 제거됨", brandId);
            } else {
                // 남은 연결들에게 업데이트된 연결 수 브로드캐스트
                broadcastConnectionCount(brandId);
            }
        }
    }

    /**
     * 특정 브랜드의 현재 SSE 연결 수를 반환합니다.
     * 
     * @param brandId 브랜드 ID
     * @return 연결된 클라이언트 수
     */
    @Override
    public int getConnectionCount(Long brandId) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        return emitterList != null ? emitterList.size() : 0;
    }

    /**
     * 특정 브랜드의 모든 SSE 연결에 에러 메시지를 전송합니다.
     * 
     * @param brandId 브랜드 ID
     * @param errorMessage 에러 메시지
     */
    @Override
    public void sendError(Long brandId, String errorMessage) {
        List<SseEmitter> emitterList = emitters.get(brandId);
        
        if (emitterList == null || emitterList.isEmpty()) {
            log.debug("[SSE] 브랜드 {}에 연결된 클라이언트가 없습니다.", brandId);
            return;
        }
        
        log.info("[SSE] 브랜드 {} 에러 메시지 전송 시작. 연결 수: {}", brandId, emitterList.size());
        
        String errorJson = toJson(Map.of("error", errorMessage));
        int beforeSize = emitterList.size();
        broadcastEvent(brandId, EVENT_ERROR, errorJson);
        
        int afterSize = emitters.get(brandId) != null ? emitters.get(brandId).size() : 0;
        log.info("[SSE] 브랜드 {} 에러 메시지 전송 완료. 성공: {}, 실패: {}", 
                brandId, afterSize, beforeSize - afterSize);
    }


    // 트렌드 데이터 업데이트 이벤트를 수신하여 SSE로 브로드캐스트
    @EventListener
    public void handleTrendDataUpdated(TrendDataUpdatedEvent event) {
        Long brandId = event.getBrandId();
        PythonTrendResponseDTO data = event.getData();
        
        log.info("[SSE][이벤트] 브랜드 {} 트렌드 데이터 업데이트 이벤트 수신", brandId);
        
        // 해당 브랜드의 모든 SSE 연결에 데이터 브로드캐스트
        broadcast(brandId, data);
    }
}

