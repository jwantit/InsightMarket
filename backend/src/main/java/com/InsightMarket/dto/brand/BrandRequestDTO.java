package com.InsightMarket.dto.brand;

import com.InsightMarket.dto.competitor.CompetitorDTO;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
public class BrandRequestDTO {
    private String name;
    private String description;
    private List<String> keywords; // 브랜드 키워드
    private List<CompetitorDTO> competitors; // 경쟁사 + 키워드
    private Boolean removeImage; // 이미지 삭제 플래그 (수정 시에만 사용)
}
