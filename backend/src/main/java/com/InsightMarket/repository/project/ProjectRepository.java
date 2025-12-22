package com.InsightMarket.repository.project;

import com.InsightMarket.domain.solution.Solution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Solution, Long> {
    
}