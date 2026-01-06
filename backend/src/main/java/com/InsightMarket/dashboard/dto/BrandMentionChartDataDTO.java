package com.InsightMarket.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrandMentionChartDataDTO {

    private String date;   // X축 날짜 (예: "2025-12-29")
    private Long count;    // 선택된 채널들의 총 합계 (선 그래프용)
    private Long naver;    // 네이버 개별 수치 (툴팁용)
    private Long youtube;  // 유튜브 개별 수치 (툴팁용)
}
