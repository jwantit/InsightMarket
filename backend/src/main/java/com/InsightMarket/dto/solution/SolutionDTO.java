package com.InsightMarket.dto.solution;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SolutionDTO {

    private Long solutionid;
    private String title;
    private int price;
    private String description;
    private Long strategyId;
    private String strategytitle;
    private String projectname;
    private String createdAt;
    private Long projectId;
    private String imageurl; //확장
    private boolean deleted;

}