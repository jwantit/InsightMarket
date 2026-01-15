package com.InsightMarket.service.brand;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.dto.brand.BrandMemberResponseDTO;
import com.InsightMarket.repository.brand.BrandMemberRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrandMemberServiceImpl implements BrandMemberService {

    private final BrandRepository brandRepository;
    private final BrandMemberRepository brandMemberRepository;
    private final MemberRepository memberRepository;

    // 공통 권한 체크
    private Member getAndCheckRequester(Long requesterId) {
        Member requester = memberRepository.findById(requesterId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if (requester.getSystemRole() != SystemRole.ADMIN &&
                requester.getSystemRole() != SystemRole.COMPANY_ADMIN) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        return requester;
    }

    // 브랜드 + 회사 검증
    private Brand getAndCheckBrand(Member requester, Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));

        // 운영자(ADMIN)는 회사 체크 예외
        if (requester.getSystemRole() != SystemRole.ADMIN) {
            if (!brand.getCompany().getId().equals(requester.getCompany().getId())) {
                throw new ApiException(ErrorCode.DIFFERENT_COMPANY_ACCESS);
            }
        }
        return brand;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandMemberResponseDTO> getBrandMembers(Long requesterId, Long brandId) {

        Member requester = getAndCheckRequester(requesterId);
        Brand brand = getAndCheckBrand(requester, brandId);

        return brandMemberRepository.findByBrandId(brand.getId()).stream()
                .map(bm -> BrandMemberResponseDTO.builder()
                        .memberId(bm.getMember().getId())
                        .name(bm.getMember().getName())
                        .email(bm.getMember().getEmail())
                        .brandRole(bm.getBrandRole())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void addBrandMember(Long requesterId, Long brandId, Long targetMemberId, BrandRole brandRole) {

        Member requester = getAndCheckRequester(requesterId);
        Brand brand = getAndCheckBrand(requester, brandId);

        Member target = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.TARGET_MEMBER_NOT_FOUND));

        // 같은 회사인지 체크 (ADMIN 제외)
        if (requester.getSystemRole() != SystemRole.ADMIN &&
                !target.getCompany().getId().equals(requester.getCompany().getId())) {
            throw new ApiException(ErrorCode.DIFFERENT_COMPANY_ACCESS);
        }

        // 중복 방지
        if (brandMemberRepository.existsByBrandIdAndMemberId(brandId, targetMemberId)) {
            throw new ApiException(ErrorCode.BRAND_MEMBER_ALREADY_EXISTS);
        }

        BrandMember brandMember = BrandMember.builder()
                .brand(brand)
                .member(target)
                .brandRole(brandRole)
                .build();

        brandMemberRepository.save(brandMember);
    }

    @Override
    public void changeBrandMemberRole(Long requesterId, Long brandId, Long targetMemberId, BrandRole brandRole) {

        Member requester = getAndCheckRequester(requesterId);
        getAndCheckBrand(requester, brandId);

        BrandMember brandMember = brandMemberRepository
                .findByBrandIdAndMemberId(brandId, targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_MEMBER_NOT_FOUND));

        brandMember.changeRole(brandRole);
    }

    @Override
    public void removeBrandMember(Long requesterId, Long brandId, Long targetMemberId) {

        Member requester = getAndCheckRequester(requesterId);
        getAndCheckBrand(requester, brandId);

        BrandMember brandMember = brandMemberRepository
                .findByBrandIdAndMemberId(brandId, targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_MEMBER_NOT_FOUND));

        brandMemberRepository.delete(brandMember);
    }
}
