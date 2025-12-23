package com.InsightMarket.service;
import com.InsightMarket.domain.common.PageRequestDTO;
import com.InsightMarket.domain.common.PageResponseDTO;
import com.InsightMarket.dto.solution.ProjectListDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.repository.strategy.StrategyRepository;
import com.InsightMarket.service.solution.SolutionService;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@SpringBootTest
@Log4j2
@ToString
public class SolutionServiceTests {

    @Autowired
    private SolutionService solutionService;

    @Test
    @Transactional
    @Commit
    public void testGetSolutionsByProjectIdFromService() {

        PageRequestDTO pageRequestDTO = PageRequestDTO.builder()
                .page(2)
                .size(10)
                .projectid(1L)
                .build();

        PageResponseDTO<SolutionDTO> response =
                solutionService.getSolutionsByProjectId(pageRequestDTO);

        // then
        log.info("------------------------------");
        log.info("Total Count   : {}", response.getTotalCount());
        log.info("Current Page  : {}", response.getCurrent());
        log.info("Page Numbers  : {}", response.getPageNumList());
        log.info("Prev Exists?  : {}", response.isPrev());
        log.info("Next Exists?  : {}", response.isNext());
        log.info("------------------------------");

        response.getDtoList().forEach(dto -> {
            log.info("SolutionDTO={}", dto);
        });

    }

    @Test
    @Transactional
    @Commit
    public void testGetProject() {

        Long brandId = 1L;

        List<ProjectListDTO> projectList =
                solutionService.getProjectsByBrandId(brandId);

        projectList.forEach(dto ->
                log.info("projectId={}, name={}", dto.getProjectId(), dto.getName())
        );
    }
}