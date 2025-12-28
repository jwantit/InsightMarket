package com.InsightMarket.controller;

import com.InsightMarket.dto.project.ProjectRequestDTO;
import com.InsightMarket.dto.project.ProjectResponseDTO;
import com.InsightMarket.service.project.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/brands/{brandId}/projects")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public Map<String, Long> create(@PathVariable Long brandId,
                                    @RequestBody ProjectRequestDTO req) {
        Long projectId = projectService.create(brandId, req);
        return Map.of("projectId", projectId);
    }

    @GetMapping
    public List<ProjectResponseDTO> list(@PathVariable Long brandId) {
        return projectService.list(brandId);
    }

    @GetMapping("/{projectId}")
    public ProjectResponseDTO detail(@PathVariable Long brandId,
                                     @PathVariable Long projectId) {
        return projectService.detail(brandId, projectId);
    }

    @PutMapping("/{projectId}")
    public void update(@PathVariable Long brandId,
                       @PathVariable Long projectId,
                       @RequestBody ProjectRequestDTO req) {
        projectService.update(brandId, projectId, req);
    }

    @DeleteMapping("/{projectId}")
    public void delete(@PathVariable Long brandId,
                       @PathVariable Long projectId) {
        projectService.delete(brandId, projectId);
    }
}