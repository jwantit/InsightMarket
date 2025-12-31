package com.InsightMarket.repository.analytics;

import com.InsightMarket.domain.analytics.AnalyticsAiAnswer;
import com.InsightMarket.domain.analytics.AnalyticsPrompt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalyticsAiAnswerRepository extends JpaRepository<AnalyticsAiAnswer, Long> {
    
    /**
     * UNIQUE(prompt_id) 제약으로 인한 중복 체크
     */
    Optional<AnalyticsAiAnswer> findByPrompt(AnalyticsPrompt prompt);
}

