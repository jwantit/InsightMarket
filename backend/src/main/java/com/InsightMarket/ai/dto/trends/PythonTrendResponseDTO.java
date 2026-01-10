package com.InsightMarket.ai.dto.trends;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
//    역할:
//    Python 응답 수신: Python API가 보낸 JSON 데이터를 Java 객체로 변환할 때 사용
//    Redis 저장: 이 객체 자체를 JSON 형태로 Redis에 캐싱
//    Frontend 응답: React 대시보드에서 fetch 했을 때 최종적으로 받는 데이터 형식
public class PythonTrendResponseDTO {
    private String keyword;     // 기준이 되는 메인 키워드 (예: "아이폰")
    private Long brandId;       // 브랜드 식별자
    private String collectedAt; // 데이터 수집 시각
    private TrendData data;     // 상세 데이터 (Top/Rising)

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendData {
        private List<TrendItemDTO> top;    // 인기 연관 검색어 리스트
        private List<TrendItemDTO> rising; // 급상승 연관 검색어 리스트
    }
}

