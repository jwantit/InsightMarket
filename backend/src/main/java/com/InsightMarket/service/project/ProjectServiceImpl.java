package com.InsightMarket.service.project;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.keyword.Keyword;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.dto.keyword.ProjectKeywordItemDTO;
import com.InsightMarket.dto.keyword.ProjectKeywordResponseDTO;
import com.InsightMarket.dto.project.ProjectRequestDTO;
import com.InsightMarket.dto.project.ProjectResponseDTO;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.keyword.KeywordRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final BrandRepository brandRepository;

    private final ProjectKeywordRepository projectKeywordRepository;
    private final KeywordRepository keywordRepository;

    @Override
    public Long create(Long brandId, ProjectRequestDTO req) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));

        validateDate(req.getStartDate(), req.getEndDate());

        Project project = Project.builder()
                .brand(brand)
                .name(req.getName())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .build();

        Project saved = projectRepository.save(project);

        // 키워드까지 한꺼번에 반영
        syncKeywords(saved, req.getKeywords());

        return saved.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponseDTO> list(Long brandId) {
        // 목록은 가볍게 키워드 제외(원하면 포함 가능)
        return projectRepository.findByBrandIdOrderByStartDateDesc(brandId).stream()
                .map(p -> ProjectResponseDTO.builder()
                        .projectId(p.getId())
                        .brandId(brandId)
                        .name(p.getName())
                        .startDate(p.getStartDate())
                        .endDate(p.getEndDate())
                        .keywords(List.of())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponseDTO detail(Long brandId, Long projectId) {
        Project p = projectRepository.findByIdAndBrandId(projectId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.PROJECT_NOT_FOUND));

        List<ProjectKeywordResponseDTO> keywords = projectKeywordRepository.findByProjectId(projectId).stream()
                .map(pk -> ProjectKeywordResponseDTO.builder()
                        .projectKeywordId(pk.getId())
                        .keywordId(pk.getKeyword().getId())
                        .keyword(pk.getKeyword().getText())
                        .enabled(pk.isEnabled())
                        .build())
                .toList();

        return ProjectResponseDTO.builder()
                .projectId(p.getId())
                .brandId(brandId)
                .name(p.getName())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .keywords(keywords)
                .build();
    }

    @Override
    public void update(Long brandId, Long projectId, ProjectRequestDTO req) {
        Project p = projectRepository.findByIdAndBrandId(projectId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.PROJECT_NOT_FOUND));

        validateDate(req.getStartDate(), req.getEndDate());

        p.changeInfo(req.getName(), req.getStartDate(), req.getEndDate());

        // 키워드까지 한꺼번에 반영
        syncKeywords(p, req.getKeywords());
    }

    @Override
    public void delete(Long brandId, Long projectId) {
        Project p = projectRepository.findByIdAndBrandId(projectId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.PROJECT_NOT_FOUND));

        projectKeywordRepository.deleteAll(projectKeywordRepository.findByProjectId(p.getId()));
        projectRepository.delete(p);
    }

    //키워드 전체 동기화
    private void syncKeywords(Project project, List<ProjectKeywordItemDTO> items) {
        Long projectId = project.getId();

        List<ProjectKeyword> existing = projectKeywordRepository.findByProjectId(projectId);
        Map<Long, ProjectKeyword> byKeywordId = existing.stream()
                .collect(Collectors.toMap(pk -> pk.getKeyword().getId(), pk -> pk));

        if (items == null) {
            return;
        }

        // 요청으로부터 받은 ProjectKeywordItemDTO 들의 "최종적으로 유지되어야 하는 keywordId" 집합을 만든다.
        //    - 기존 keywordId는 그대로
        //    - 신규(null)는 text로 Keyword 생성/재사용 후 그 id를 포함
        Set<Long> keepIds = new java.util.HashSet<>();

        for (ProjectKeywordItemDTO item : items) {
            boolean enabled = item.getEnabled() == null || item.getEnabled();

            Long reqKeywordId = item.getKeywordId();  // 요청값(절대 재할당 X)
            Long keywordId = item.getKeywordId();  // 최종값(신규 생성 시 재할당 가능)

            // A) 신규 생성/재사용 루트
            if (keywordId == null) {
                String text = (item.getText() == null) ? "" : item.getText().trim().toLowerCase();
                if (text.isBlank()) {
                    // text가 비면 무시(또는 예외)
                    continue;
                }

                Keyword keyword = keywordRepository.findByText(text)
                        .orElseGet(() -> keywordRepository.save(
                                Keyword.builder().text(text).build()
                        ));

                keywordId = keyword.getId(); // 최종 keywordId 확정
            } else {
                final Long kid = reqKeywordId;
                // B) 기존 keywordId 루트: 존재 검증(선택)
                keywordRepository.findById(keywordId)
                        .orElseThrow(() -> new ApiException(ErrorCode.KEYWORD_NOT_FOUND));
            }

            keepIds.add(keywordId);

            // 1) upsert(update + insert): 있으면 enabled 변경, 없으면 생성
            ProjectKeyword pk = byKeywordId.get(keywordId);
            if (pk == null) {
                final Long kid = reqKeywordId;
                Keyword keyword = keywordRepository.findById(keywordId)
                        .orElseThrow(() -> new ApiException(ErrorCode.KEYWORD_NOT_FOUND));

                projectKeywordRepository.save(ProjectKeyword.builder()
                        .project(project)
                        .keyword(keyword)
                        .enabled(enabled)
                        .build());
            } else {
                pk.changeEnabled(enabled);
            }
        }

        // 2) 삭제: keepIds에 없는 기존(projectKeyword) 연결은 제거
        for (ProjectKeyword pk : existing) {
            Long kid = pk.getKeyword().getId();
            if (!keepIds.contains(kid)) {
                projectKeywordRepository.delete(pk);
            }
        }
    }

    private void validateDate(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new ApiException(ErrorCode.PROJECT_DATE_INVALID);
        }
        if (end.isBefore(start)) {
            throw new ApiException(ErrorCode.PROJECT_DATE_INVALID);
        }
    }
}
