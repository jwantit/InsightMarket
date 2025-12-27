package com.InsightMarket.repository.competitor;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.company.Competitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompetitorRepository extends JpaRepository<Competitor, Long> {

    List<Competitor> findByBrand(Brand brand);

    List<Competitor> findByBrandIn(List<Brand> brands);

    void deleteByBrand(Brand brand);
}
