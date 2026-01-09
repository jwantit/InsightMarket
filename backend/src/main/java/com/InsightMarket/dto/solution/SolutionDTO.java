package com.InsightMarket.dto.solution;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy년MM월dd일", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
    private Long projectId;
    private boolean deleted;

}