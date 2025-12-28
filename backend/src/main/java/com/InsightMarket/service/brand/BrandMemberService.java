package com.InsightMarket.service.brand;

import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.dto.brand.BrandMemberResponseDTO;

import java.util.List;

public interface BrandMemberService {

    // 브랜드 멤버 목록 조회
    List<BrandMemberResponseDTO> getBrandMembers(Long requesterId, Long brandId);

    // 브랜드 멤버 추가
    void addBrandMember(Long requesterId, Long brandId, Long targetMemberId, BrandRole brandRole);

    // 브랜드 멤버 역할 변경
    void changeBrandMemberRole(Long requesterId, Long brandId, Long targetMemberId, BrandRole brandRole);

    // 브랜드 멤버 제거
    void removeBrandMember(Long requesterId, Long brandId, Long targetMemberId);
}
