package com.InsightMarket.service.solution;

import com.InsightMarket.dto.solution.ProjectListDTO;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import jakarta.transaction.Transactional;

import java.util.List;

public interface SolutionService {
    PageResponseDTO<SolutionDTO> getSolutionsByProjectId(PageRequestDTO pageRequestDTO);

    List<ProjectListDTO> getProjectsByBrandId(Long brandId);

    List<SolutionDTO> getLatestSolutionByProject(Long projectid);

    void deleteSolutionProduct(Long solutionid);

}
