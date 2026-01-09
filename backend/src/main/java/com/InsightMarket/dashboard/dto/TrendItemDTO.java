package com.InsightMarket.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrendItemDTO {

    //역할: 리스트의 한 줄(행)을 구성하는 객체
    //연결 위치: BrandTrendResponseDTO 내부의 List 타입으로 포함

    // 파이썬 JSON의 "query" 키와 매칭되는 실제 연관 검색어
    private String query;
    // 연관도 점수 또는 검색량 (JSON의 "value")
    private String value;
}

