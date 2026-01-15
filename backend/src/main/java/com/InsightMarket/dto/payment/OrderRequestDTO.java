package com.InsightMarket.dto.payment;

import lombok.Data;

import java.util.List;
@Data
public class OrderRequestDTO {
    private Long projectId;// 어떤 프로젝트 내에서의 구매인지 (공통)
    private List<OrderItemDTO> solutions;
}