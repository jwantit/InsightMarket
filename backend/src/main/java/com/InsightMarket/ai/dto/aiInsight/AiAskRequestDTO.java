package com.InsightMarket.ai.dto.aiInsight;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiAskRequestDTO {
    private Long brandId;
    private Long projectId; // 프로젝트 ID (필수)
    private String question;
    private Integer topK; // null이면 기본값 처리
}

