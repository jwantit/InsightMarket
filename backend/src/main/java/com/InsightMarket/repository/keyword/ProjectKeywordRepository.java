package com.InsightMarket.repository.keyword;

import com.InsightMarket.ai.dto.scheduler.ProjectKeywordIdNameDTO;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectKeywordRepository extends JpaRepository<ProjectKeyword, Long> {

    List<ProjectKeyword> findByProjectId(Long projectId);

    Optional<ProjectKeyword> findByProjectIdAndKeyword(Long projectId, String keyword);

    //스케줄러 (활성화된 키워드만)
    @Query("SELECT new com.InsightMarket.ai.dto.scheduler.ProjectKeywordIdNameDTO(pk.id, pk.keyword, pk.brand.id, pk.brand.name, pk.project.id) " +
            "FROM ProjectKeyword pk " +
            "JOIN pk.brand " +
            "JOIN pk.project " +
            "WHERE pk.enabled = true")
    List<ProjectKeywordIdNameDTO> findAllProjectKeywordIdAndKeywordName();
}