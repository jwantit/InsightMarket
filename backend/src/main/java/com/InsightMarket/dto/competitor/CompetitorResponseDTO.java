package com.InsightMarket.dto.competitor;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CompetitorResponseDTO {

    private Long competitorId;
    private String name;
    private boolean enabled;        // 경쟁사 활성 여부
    private List<String> keywords;  // 경쟁사 키워드
}
