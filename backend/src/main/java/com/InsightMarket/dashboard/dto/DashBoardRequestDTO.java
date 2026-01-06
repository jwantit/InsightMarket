package com.InsightMarket.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashBoardRequestDTO {

    private Long brandId; //브랜드 아이디
    private List<String> contentChannel; //선택한 채널
    private String unit; //일별 주별 월별
}
