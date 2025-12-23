package com.InsightMarket.service.solution;

import com.InsightMarket.domain.common.PageRequestDTO;
import com.InsightMarket.domain.common.PageResponseDTO;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.repository.solution.SolutionRepository;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class SolutionServiceImpl implements SolutionService {

    private final SolutionRepository solutionRepository;

    @Override
    public PageResponseDTO<SolutionDTO> getSolutionsByProjectId(PageRequestDTO pageRequestDTO) {

        log.info("SolutionServiceImpl 진입 페이징처리 + DB솔루션 조회중");


//        public class PageRequestDTO {
//            private int page = 1;
//            private int size = 10;
//            Long projectid;
//        }
        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1,  //페이지 시작 번호가 0부터 시작하므로
                pageRequestDTO.getSize(),
                Sort.by("id").descending()); //id는 솔루션의 고류PK 오름차 내림차 설정
                                                                                 //프로젝트 , 페이징
        Page<Solution> result = solutionRepository.getSolutionsByProjectId(pageRequestDTO.getProjectid(), pageable);
        //Page{
        //solution 10개 2페이지면 10개 건너뛰고
        //getTotalElements 전체개수 (조회한 기준)
        //totalPages 전체페이지수 54개면 6페이지
        //number 현재페이지번호 1페이지
        //size 10개
        //Sort 정렬설정
        //hasNext 다음 페이지 존재 여부 boolean
        //isFirst 첫 페이지 여부 boolean
        // }

        List<SolutionDTO> dtoList = result.getContent().stream()
                .map(solution -> SolutionDTO.builder()
                        .Solutionid(solution.getId())
                        .title(solution.getTitle())
                        .price(solution.getPrice())
                        .description(solution.getDescription())
                        .strategyId(solution.getStrategy().getId())
                        .projectId(solution.getProject().getId())
                        .deleted(solution.isDeleted())
                        .build()
                )
                .toList();

        long totalCount = result.getTotalElements();

        return PageResponseDTO.<SolutionDTO>withAll()
                .dtoList(dtoList)
                .totalCount(totalCount)
                .pageRequestDTO(pageRequestDTO)
                .build();

    }


}
