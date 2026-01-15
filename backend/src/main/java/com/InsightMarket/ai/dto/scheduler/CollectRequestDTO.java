package com.InsightMarket.ai.dto.scheduler;


import lombok.Data;

@Data
public class CollectRequestDTO {
    private Long brandId;
    private Long projectId;
    private String collectedAt;
    private Object rawJson; // 리스트 형태의 원본 데이터

    // Getter, Setter 생략 (Lombok @Data 권장)
}

