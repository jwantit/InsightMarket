package com.InsightMarket.service.solution;

import com.InsightMarket.domain.project.Project;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.solution.ProjectListDTO;
import com.InsightMarket.dto.solution.SolutionDTO;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.repository.payment.PaymentRepository;
import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class SolutionServiceImpl implements SolutionService {

    private final SolutionRepository solutionRepository;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;

    @Override//프로젝트 단위 모든 솔루션 상품조회
    public PageResponseDTO<SolutionDTO> getSolutionsByProjectId(PageRequestDTO pageRequestDTO) {

        log.info("SolutionServiceImpl 진입 페이징처리 + DB솔루션 조회중");

//    //프로젝트 단위 모든 솔루션 상품조회
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
                        .solutionid(solution.getId())
                        .title(solution.getTitle())
                        .price(solution.getPrice())
                        .description(solution.getDescription())
                        .projectname(solution.getProject().getName())
                        .strategyId(solution.getStrategy().getId())
                        .strategytitle(solution.getStrategy().getTitle())
                        .projectId(solution.getProject().getId())
                        .deleted(solution.isDeleted())
                        .createdAt( solution.getCreatedAt()
                                .format(DateTimeFormatter.ofPattern("yyyy년MM월dd일")))
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

    //브랜드에 해당하는 프로젝트 가져오기
    @Override
    @Transactional(readOnly = true)
    public List<ProjectListDTO> getProjectsByBrandId(Long brandId) {

        List<Project> projects = projectRepository.findByBrandIdProject(brandId);

        return projects.stream()
                .map(project -> ProjectListDTO.builder()
                        .projectId(project.getId())
                        .name(project.getName())
                        .build()
                )
                .toList();
    }

    //전략에 해당하는 솔루션 가지고 오기
    @Override
    public List<SolutionDTO> getLatestSolutionByProject(Long projectid){

        Optional<Solution> solutions = solutionRepository.findTopByProject_IdAndIsPurchasedFalseOrderByCreatedAtDescIdDesc(projectid);

        Solution top = solutions.orElseThrow();

        List<Solution> result = solutionRepository.findSolutionsByProjectAndStrategy(
                top.getProject().getId(),top.getStrategy().getId());

        return result.stream()
                .map(solution -> SolutionDTO.builder()
                        .solutionid(solution.getId())
                        .title(solution.getTitle())
                        .price(solution.getPrice())
                        .description(solution.getDescription())
                        .projectname(solution.getProject().getName())
                        .strategyId(solution.getStrategy().getId())
                        .strategytitle(solution.getStrategy().getTitle())
                        .projectId(solution.getProject().getId())
                        .deleted(solution.isDeleted())
                        .createdAt( solution.getCreatedAt()
                                .format(DateTimeFormatter.ofPattern("yyyy년MM월dd일")))
                        .build()
                )
                .toList();
    }

    @Override
    public void deleteSolutionProduct(Long solutionid) {
        solutionRepository.softDeleteById(solutionid);
        log.info("삭제(숨김처리 완료)");
    }

    @Override
    @Transactional(readOnly = true)
    public SolutionDTO getPurchasedSolutionDetail(Long solutionId, Long memberId) {
        log.info("SolutionServiceImpl 진입 구매한 솔루션 상세 조회 solutionId={}, memberId={}", solutionId, memberId);

        // 1. 솔루션 조회
        Solution solution = solutionRepository.findById(solutionId)
                .orElseThrow(() -> new ApiException(ErrorCode.SOLUTION_NOT_FOUND));

        // 2. 구매 여부 확인
        boolean isPurchased = paymentRepository.isSolutionPurchasedByMember(solutionId, memberId);
        if (!isPurchased) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        // 3. DTO 변환 및 반환
        return SolutionDTO.builder()
                .solutionid(solution.getId())
                .title(solution.getTitle())
                .price(solution.getPrice())
                .description(solution.getDescription())
                .projectname(solution.getProject().getName())
                .strategyId(solution.getStrategy().getId())
                .strategytitle(solution.getStrategy().getTitle())
                .projectId(solution.getProject().getId())
                .deleted(solution.isDeleted())
                .createdAt(solution.getCreatedAt()
                        .format(DateTimeFormatter.ofPattern("yyyy년MM월dd일")))
                .build();
    }
}