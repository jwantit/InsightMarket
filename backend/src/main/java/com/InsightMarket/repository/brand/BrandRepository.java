package com.InsightMarket.repository.brand;

import com.InsightMarket.ai.dto.scheduler.BrandIdNameDTO;
import com.InsightMarket.domain.brand.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long>{

    
    //스케줄러
    @Query("SELECT new com.InsightMarket.ai.dto.scheduler.BrandIdNameDTO(b.id, b.name) FROM Brand b")
    List<BrandIdNameDTO> findAllBrandIdAndName();
}