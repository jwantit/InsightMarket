package com.InsightMarket.repository.keyword;

import com.InsightMarket.domain.keyword.ProjectKeyword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectKeywordRepository extends JpaRepository<ProjectKeyword, Long> {

    List<ProjectKeyword> findByProjectId(Long projectId);

    Optional<ProjectKeyword> findByProjectIdAndKeywordId(Long projectId, Long keywordId);
}