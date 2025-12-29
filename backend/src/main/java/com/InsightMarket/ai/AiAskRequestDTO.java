package com.InsightMarket.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiAskRequestDTO {
    private Long brandId;
    private String question;
    private Integer topK; // null이면 기본값 처리
}