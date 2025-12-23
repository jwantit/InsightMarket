package com.InsightMarket.dto.solution;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SolutionDTO {

    private Long Solutionid;
    private String title;
    private int price;
    private String description;
    private Long strategyId;
    private Long projectId;
    private String imageurl; //확장
    private boolean deleted;

}