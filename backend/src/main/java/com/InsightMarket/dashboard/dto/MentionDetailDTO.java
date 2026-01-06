package com.InsightMarket.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
class MentionDetailDTO {
    private String date;    // stat_date
    private Long naver;     // NAVER 언급량
    private Long youtube;   // YOUTUBE 언급량
    private Long total;     // 합계
}