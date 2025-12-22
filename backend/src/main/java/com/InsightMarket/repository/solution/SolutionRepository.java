package com.InsightMarket.repository.solution;


import com.InsightMarket.domain.solution.Solution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SolutionRepository extends JpaRepository<Solution, Long> {

    @Query("SELECT s FROM Solution s WHERE s.project.projectId = :projectId")
    List<Solution> findByProjectId(@Param("projectId") Integer projectId);
}