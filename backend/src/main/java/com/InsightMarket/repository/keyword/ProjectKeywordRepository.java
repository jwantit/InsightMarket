package com.InsightMarket.repository.keyword;

import com.InsightMarket.ai.scheduling.ProjectKeywordIdNameDTO;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectKeywordRepository extends JpaRepository<ProjectKeyword, Long> {

    List<ProjectKeyword> findByProjectId(Long projectId);

    Optional<ProjectKeyword> findByProjectIdAndKeyword(Long projectId, String keyword);

    //스케줄러 (활성화된 키워드만)
    @Query("SELECT new com.InsightMarket.ai.scheduling.ProjectKeywordIdNameDTO(pk.id, pk.keyword, pk.brand.id, pk.brand.name) " +
            "FROM ProjectKeyword pk " +
            "JOIN pk.brand " +
            "WHERE pk.enabled = true")
    List<ProjectKeywordIdNameDTO> findAllProjectKeywordIdAndKeywordName();
}