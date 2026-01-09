package com.InsightMarket.repository.solution;

import com.InsightMarket.domain.solution.Solution;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SolutionRepository extends JpaRepository<Solution, Long> {

    //프로젝트 단위 모든 솔루션 상품조회  /삭제플레그 false 와 구매 플래그 false 인것만 가지고 온다
    @Query("SELECT s FROM Solution s WHERE s.project.id = :projectId and s.isPurchased = false")
    Page<Solution> getSolutionsByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    //“특정 프로젝트에 속한 솔루션 중에서
    //createdAt 기준으로 최신 →
    //createdAt이 같으면 id 기준으로 최신 →
    //그중 맨 위 1개를 가져와라”
    Optional<Solution> findTopByProject_IdAndIsPurchasedFalseOrderByCreatedAtDescIdDesc(Long projectId);


    //최근 솔루션을 기반으로 전략과 프로젝트아이디에 해당하는 솔루션을 가져온다
    @Query("""
    select s 
    from Solution s
    where s.project.id = :projectId
      and s.strategy.id = :strategyId
      and s.isPurchased = false
    order by s.createdAt desc""")
    List<Solution> findSolutionsByProjectAndStrategy(
            @Param("projectId") Long projectId,
            @Param("strategyId") Long strategyId
    );


       //삭제 숨김처리
        @Modifying //업데이트 /삭제 를 위한 어노
        @Query("update Solution s set s.deleted = true where s.id = :solutionId")
        void softDeleteById(@Param("solutionId") Long solutionId);





        @Query("""
           select s
           from Solution s
           where s.id = :solutionId
           and s.project.id = :projectId""")
    Optional<Solution> findSolutionOfProject(
            @Param("solutionId") Long solutionId,
            @Param("projectId") Long projectId
    );
    
    // 프로젝트당 무료 제공된 리포트 개수 조회 (isPurchased = false인 것만)
    @Query("SELECT COUNT(s) FROM Solution s WHERE s.project.id = :projectId AND s.isPurchased = false")
    long countFreeReportsByProjectId(@Param("projectId") Long projectId);
}

