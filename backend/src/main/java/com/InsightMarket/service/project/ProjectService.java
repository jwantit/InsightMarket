package com.InsightMarket.service.project;

import com.InsightMarket.dto.project.ProjectRequestDTO;
import com.InsightMarket.dto.project.ProjectResponseDTO;

import java.util.List;

public interface ProjectService {

    Long create(Long brandId, ProjectRequestDTO req);

    List<ProjectResponseDTO> list(Long brandId);

    ProjectResponseDTO detail(Long brandId, Long projectId);

    void update(Long brandId, Long projectId, ProjectRequestDTO req);

    void delete(Long brandId, Long projectId);
}