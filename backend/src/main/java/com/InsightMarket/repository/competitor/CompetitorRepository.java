package com.InsightMarket.repository.competitor;

import com.InsightMarket.ai.scheduling.CompetitorIdNameDTO;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.company.Competitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CompetitorRepository extends JpaRepository<Competitor, Long> {

    List<Competitor> findByBrand(Brand brand);

    List<Competitor> findByBrandIn(List<Brand> brands);

    void deleteByBrand(Brand brand);

    //스케줄러 (활성화된 경쟁사만)
    @Query("SELECT new com.InsightMarket.ai.scheduling.CompetitorIdNameDTO(c.id, c.name, c.brand.id) " +
            "FROM Competitor c " +
            "WHERE c.enabled = true")
    List<CompetitorIdNameDTO> findAllCompetitorIdAndName();
}
