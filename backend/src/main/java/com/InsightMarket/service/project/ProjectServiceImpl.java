package com.InsightMarket.service.project;

import com.InsightMarket.ai.PythonRagClient;
import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.dto.keyword.ProjectKeywordItemDTO;
import com.InsightMarket.dto.keyword.ProjectKeywordResponseDTO;
import com.InsightMarket.dto.project.ProjectRequestDTO;
import com.InsightMarket.dto.project.ProjectResponseDTO;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
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
    private final PythonRagClient pythonRagClient;

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
        syncKeywords(saved, req.getKeywords(), true);

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
                        .keyword(pk.getKeyword())
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
        syncKeywords(p, req.getKeywords(), false);
    }

    @Override
    public void delete(Long brandId, Long projectId) {
        Project p = projectRepository.findByIdAndBrandId(projectId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.PROJECT_NOT_FOUND));

        projectKeywordRepository.deleteAll(projectKeywordRepository.findByProjectId(p.getId()));
        projectRepository.delete(p);
    }

    //키워드 전체 동기화
    private void syncKeywords(Project project, List<ProjectKeywordItemDTO> items, boolean isCreate) {
        Long projectId = project.getId();
        Brand brand = project.getBrand();

        List<ProjectKeyword> existing = projectKeywordRepository.findByProjectId(projectId);
        // keyword 문자열로 매핑 (정규화된 형태로 비교)
        Map<String, ProjectKeyword> byKeyword = existing.stream()
                .collect(Collectors.toMap(
                        pk -> normalizeKeyword(pk.getKeyword()),
                        pk -> pk
                ));

        if (items == null) {
            return;
        }

        // 유지할 키워드 집합 (정규화된 형태)
        Set<String> keepKeywords = new HashSet<>();

        for (ProjectKeywordItemDTO item : items) {
            boolean enabled = item.getEnabled() == null || item.getEnabled();
            String text = item.getText();

            if (text == null || text.isBlank()) {
                    continue;
                }

            // 정규화: 소문자, 공백 정리
            String normalized = normalizeKeyword(text);
            if (normalized.isBlank()) {
                continue;
            }

            keepKeywords.add(normalized);

            // upsert: 있으면 enabled 변경, 없으면 생성
            ProjectKeyword pk = byKeyword.get(normalized);
            boolean isNew = (pk == null);
            if (pk == null) {
                // 신규 생성
                pk = projectKeywordRepository.save(ProjectKeyword.builder()
                        .brand(brand)
                        .project(project)
                        .keyword(normalized)
                        .enabled(enabled)
                        .build());
            } else {
                // 기존 키워드의 enabled만 변경
                pk.changeEnabled(enabled);
            }
            
            // 프로젝트 키워드 생성 시에만 재수집 호출
            if (isNew) {
                pythonRagClient.recollect("PROJECT", pk.getId(), pk.getKeyword(), brand.getId(), brand.getName());
            }
        }

        // 삭제: keepKeywords에 없는 기존 키워드 제거
        for (ProjectKeyword pk : existing) {
            String normalized = normalizeKeyword(pk.getKeyword());
            if (!keepKeywords.contains(normalized)) {
                projectKeywordRepository.delete(pk);
            }
        }
    }

    // 키워드 정규화: 소문자, 공백 정리
    private String normalizeKeyword(String text) {
        if (text == null) {
            return "";
        }
        return text.trim().replaceAll("\\s+", " ").toLowerCase();
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
