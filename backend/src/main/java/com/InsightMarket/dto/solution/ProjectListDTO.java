package com.InsightMarket.dto.solution;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectListDTO {
    private Long projectId;
    private String name;
}
