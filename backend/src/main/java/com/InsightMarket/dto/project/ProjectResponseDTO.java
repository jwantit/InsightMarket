package com.InsightMarket.dto.project;

import com.InsightMarket.dto.keyword.ProjectKeywordResponseDTO;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ProjectResponseDTO {
    private Long projectId;
    private Long brandId;

    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    private List<ProjectKeywordResponseDTO> keywords;
}
