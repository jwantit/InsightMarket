package com.InsightMarket.repository.brand;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BrandMemberRepository extends JpaRepository<BrandMember, Long> {

    Optional<BrandMember> findByMemberIdAndBrandId(Long memberId, Long brandId);

    // 회원이 같은 brand와 join 조회 (n+1)
    @Query("""
            select bm
            from BrandMember bm
            join fetch bm.brand b
            where bm.member = :member
            """)
    List<BrandMember> findByMemberWithBrand(@Param("member") Member member);

    void deleteByBrand(Brand brand);
}