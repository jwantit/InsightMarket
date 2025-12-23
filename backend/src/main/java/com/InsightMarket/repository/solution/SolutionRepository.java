package com.InsightMarket.repository.solution;

import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.domain.strategy.Strategy;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface SolutionRepository extends JpaRepository<Solution, Long> {

    //프로젝트 단위 모든 솔루션 상품조회
    @Query("SELECT s FROM Solution s WHERE s.project.id = :projectId")
    Page<Solution> getSolutionsByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Query("""
        select s
        from Solution s
        join s.strategy st
        where s.project.id = :projectId
          and st.createdAt = (
              select max(st2.createdAt)
              from Solution s2
              join s2.strategy st2
              where s2.project.id = :projectId
          )
    """)
    List<Solution> findLatestStrategySolutionsByProject(
            @Param("projectId") Long projectId
    );



}