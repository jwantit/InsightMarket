package com.InsightMarket.dto.keyword;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectKeywordItemDTO {
    private Long projectKeywordId; // 기존이면 값, 신규면 null
    private String text;          // 키워드 텍스트 (신규/기존 모두 사용)
    private Boolean enabled;      // null이면 true로 처리
}
