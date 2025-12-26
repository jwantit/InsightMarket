package com.InsightMarket.controller;

import com.InsightMarket.dto.solution.ProjectListDTO;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.service.solution.SolutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/solution")
public class SolutionController {

    private final SolutionService solutionService;

    //프로젝트 단위 조회
    @GetMapping("/list")
    public PageResponseDTO<SolutionDTO> list(PageRequestDTO pageRequestDTO){

        log.info("SolutionController 진입 프로젝트n 의 솔루션을 조회합니다.");

        return solutionService.getSolutionsByProjectId(pageRequestDTO);
    }

    //프로젝트 선택
    @GetMapping("/brand/{brandId}")
    public List<ProjectListDTO> getProjectsByBrand(
            @PathVariable Long brandId
    ) {
        log.info("SolutionController 진입 프로젝트 선택");

        return solutionService.getProjectsByBrandId(brandId);
    }

    //프로젝트 단위 솔루션 전략 최근 필터 필터용
    @GetMapping("/latest/strategy/{projectid}")
    public List<SolutionDTO> getStrategyBySolution(
            @PathVariable("projectid") Long projectid
    ) {
        log.info("SolutionController 진입 최근전략");
        return solutionService.getLatestSolutionByProject(projectid);
    }

    //솔루션 삭제(숨김)
    @DeleteMapping("delete/{solutionid}")
    public Map<String, String> remove(@PathVariable("solutionid") Long solutionid){
        log.info("SolutionController 진입 삭제");
        solutionService.deleteSolutionProduct(solutionid);
     return Map.of("RESULT", "SUCCESS");
    }
}




