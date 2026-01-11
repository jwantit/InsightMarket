package com.InsightMarket.service.sse;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import com.InsightMarket.ai.service.trends.TrendsRedisService;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * 트렌드 데이터 SSE(Server-Sent Events) 연결을 관리하는 서비스 인터페이스
 */
public interface TrendSseService {
    
    /**
     * 브랜드별 트렌드 데이터 SSE 연결을 생성하고 등록합니다.
     * 
     * @param brandId 브랜드 ID
     * @return SseEmitter SSE 연결 객체
     */
    SseEmitter subscribe(Long brandId);
    
    /**
     * 브랜드별 트렌드 데이터 SSE 연결을 생성하고 등록하며 초기 데이터를 전송합니다.
     * 
     * @param brandId 브랜드 ID
     * @return SseEmitter SSE 연결 객체
     */
    SseEmitter subscribeWithInitialData(Long brandId);
    
    /**
     * 특정 브랜드의 모든 SSE 연결에 트렌드 데이터를 브로드캐스트합니다.
     * 
     * @param brandId 브랜드 ID
     * @param data 브로드캐스트할 트렌드 데이터
     */
    void broadcast(Long brandId, PythonTrendResponseDTO data);
    
    /**
     * 특정 브랜드의 SSE 연결을 제거합니다.
     * 
     * @param brandId 브랜드 ID
     * @param emitter 제거할 SseEmitter
     */
    void removeEmitter(Long brandId, SseEmitter emitter);
    
    /**
     * 특정 브랜드의 현재 SSE 연결 수를 반환합니다.
     * 
     * @param brandId 브랜드 ID
     * @return 연결된 클라이언트 수
     */
    int getConnectionCount(Long brandId);
    
    /**
     * 특정 브랜드의 모든 SSE 연결에 에러 메시지를 전송합니다.
     * 
     * @param brandId 브랜드 ID
     * @param errorMessage 에러 메시지
     */
    void sendError(Long brandId, String errorMessage);
}

