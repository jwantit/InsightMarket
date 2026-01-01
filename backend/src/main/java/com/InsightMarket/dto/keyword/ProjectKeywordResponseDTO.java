package com.InsightMarket.dto.keyword;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectKeywordResponseDTO {
    private Long projectKeywordId; // 프로젝트 키워드 PK
    private String keyword;        // 키워드 문자열
    private boolean enabled;      // 활성화 여부
}
