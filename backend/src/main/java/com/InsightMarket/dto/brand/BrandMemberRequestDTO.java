package com.InsightMarket.dto.brand;

import com.InsightMarket.domain.brand.BrandRole;
import lombok.Getter;

@Getter
public class BrandMemberRequestDTO {
    private Long memberId;
    private BrandRole brandRole;
}
