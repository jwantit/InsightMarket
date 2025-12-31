package com.InsightMarket.repository.analytics;

import com.InsightMarket.domain.analytics.AnalyticsPrompt;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsPromptRepository extends JpaRepository<AnalyticsPrompt, Long> {
    
    /**
     * UNIQUE(project_id, member_id, question) 제약으로 인한 중복 체크
     * member_id가 null일 수 있으므로 Optional로 반환
     */
    Optional<AnalyticsPrompt> findByProjectAndMemberAndQuestion(Project project, Member member, String question);
}

