package com.InsightMarket.repository.brand;


import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.strategy.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface BrandRepository extends JpaRepository<Brand, Long>{
}
