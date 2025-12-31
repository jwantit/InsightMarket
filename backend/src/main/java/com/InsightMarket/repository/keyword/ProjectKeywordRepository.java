package com.InsightMarket.repository.keyword;

import com.InsightMarket.ai.scheduling.ProjectKeywordIdNameDTO;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectKeywordRepository extends JpaRepository<ProjectKeyword, Long> {

    List<ProjectKeyword> findByProjectId(Long projectId);

    Optional<ProjectKeyword> findByProjectIdAndKeywordId(Long projectId, Long keywordId);


    //스케줄러 (활성화된 키워드만)
    @Query("SELECT new com.InsightMarket.ai.scheduling.ProjectKeywordIdNameDTO(pk.id, k.text) " +
            "FROM ProjectKeyword pk " +
            "JOIN pk.keyword k " +
            "WHERE pk.enabled = true")
    List<ProjectKeywordIdNameDTO> findAllProjectKeywordIdAndKeywordName();
}