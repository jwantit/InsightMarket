package com.InsightMarket.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BrandWordCloudResponseDTO {
    List<BrandWordCloudDTO> wordCloudRow;
}
