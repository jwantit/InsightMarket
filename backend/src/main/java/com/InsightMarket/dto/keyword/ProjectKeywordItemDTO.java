package com.InsightMarket.dto.keyword;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectKeywordItemDTO {
    private Long keywordId;   // 기존이면 값, 신규면 null
    private String text;      // 신규 생성용
    private Boolean enabled; // null이면 true로 처리
}
