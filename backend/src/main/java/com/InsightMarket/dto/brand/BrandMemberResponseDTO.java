package com.InsightMarket.dto.brand;

import com.InsightMarket.domain.brand.BrandRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BrandMemberResponseDTO {
    private Long memberId;
    private String name;
    private String email;
    private BrandRole brandRole;
}
