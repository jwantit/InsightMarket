package com.InsightMarket.repository.keyword;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.keyword.BrandKeyword;
import com.InsightMarket.domain.keyword.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BrandKeywordRepository extends JpaRepository<BrandKeyword, Long> {

    @Query("""
            select bk
            from BrandKeyword bk
            join fetch bk.keyword k
            where bk.brand in :brands
            """)
    List<BrandKeyword> findByBrandInWithKeyword(@Param("brands") List<Brand> brands);

    @Query("select bk from BrandKeyword bk join fetch bk.keyword where bk.brand = :brand")
    List<BrandKeyword> findByBrandWithKeyword(@Param("brand") Brand brand);

    void deleteByBrand(Brand brand);
}