package com.InsightMarket.dto.brand;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BrandResponseDTO {
    private Long brandId;
    private String name;
    private String description;
    private String role; // BRAND_ADMIN / MARKETER
}
