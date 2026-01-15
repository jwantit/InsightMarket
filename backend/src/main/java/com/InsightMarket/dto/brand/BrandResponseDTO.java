package com.InsightMarket.dto.brand;

import com.InsightMarket.dto.competitor.CompetitorResponseDTO;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BrandResponseDTO {
    private Long brandId;
    private String name;
    private String description;
    private String role; // BRAND_ADMIN / MARKETER

    private Long imageFileId; // 브랜드 이미지 파일 ID

    private List<String> keywords;        // 브랜드 키워드
    private List<CompetitorResponseDTO> competitors; // 경쟁사 목록
}
