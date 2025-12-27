package com.InsightMarket.dto.competitor;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class CompetitorDTO {

    private Long competitorId;
    private String name;
    private boolean enabled;          // 경쟁사만 토글
    private List<String> keywords;    // 경쟁사 키워드
}
