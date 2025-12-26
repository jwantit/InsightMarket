package com.InsightMarket.repository.brand;

import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandMemberRepository extends JpaRepository<BrandMember, Long> {

    List<BrandMember> findByMember(Member member);

    Optional<BrandMember> findByMemberIdAndBrandId(Long memberId, Long brandId);
}