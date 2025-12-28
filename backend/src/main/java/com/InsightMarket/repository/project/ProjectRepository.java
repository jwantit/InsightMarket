package com.InsightMarket.repository.project;

import com.InsightMarket.domain.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    //프로젝트 선택을 하기 위함
    @Query("select p from Project p where p.brand.id = :brandId")
    List<Project> findByBrandIdProject(@Param("brandId") Long brandId);

    List<Project> findByBrandIdOrderByStartDateDesc(Long brandId);

    Optional<Project> findByIdAndBrandId(Long projectId, Long brandId);

    boolean existsByIdAndBrandId(Long projectId, Long brandId);
}