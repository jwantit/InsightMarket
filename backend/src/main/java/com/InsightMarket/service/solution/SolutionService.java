package com.InsightMarket.service.solution;

import com.InsightMarket.domain.common.PageRequestDTO;
import com.InsightMarket.domain.common.PageResponseDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import jakarta.transaction.Transactional;

import java.util.List;

@Transactional
public interface SolutionService {
    PageResponseDTO<SolutionDTO> getSolutionsByProjectId(PageRequestDTO pageRequestDTO);

}
