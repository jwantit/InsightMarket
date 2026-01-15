package com.InsightMarket.common.event;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * 트렌드 데이터가 업데이트되었을 때 발생하는 이벤트
 */
@Getter
public class TrendDataUpdatedEvent extends ApplicationEvent {
    
    private final Long brandId;
    private final PythonTrendResponseDTO data;
    
    public TrendDataUpdatedEvent(Object source, Long brandId, PythonTrendResponseDTO data) {
        super(source);
        this.brandId = brandId;
        this.data = data;
    }
}

