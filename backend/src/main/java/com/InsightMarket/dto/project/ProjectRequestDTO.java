package com.InsightMarket.dto.project;

import com.InsightMarket.dto.keyword.ProjectKeywordItemDTO;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ProjectRequestDTO {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    // 생성/수정 시 키워드도 같이 보내서 한번에 반영 가능
    private List<ProjectKeywordItemDTO> keywords;
}
