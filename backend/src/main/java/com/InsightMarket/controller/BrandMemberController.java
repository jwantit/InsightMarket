package com.InsightMarket.controller;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.dto.brand.BrandMemberRequestDTO;
import com.InsightMarket.dto.brand.BrandMemberResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.brand.BrandMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/brands/{brandId}/members")
public class BrandMemberController {

    private final BrandMemberService brandMemberService;
    private final MemberRepository memberRepository;
    private final BrandRepository brandRepository;

    //공통 권한 체크
    private void checkCompanyAdmin(Member member) {
        if (member.getSystemRole() != SystemRole.ADMIN &&
                member.getSystemRole() != SystemRole.COMPANY_ADMIN) {
            throw new AccessDeniedException("브랜드 권한 관리는 회사 관리자만 가능합니다.");
        }
    }

    // 브랜드 멤버 조회
    @GetMapping
    public List<BrandMemberResponseDTO> getBrandMembers(
            @PathVariable Long brandId,
            @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        checkCompanyAdmin(member);

        return brandMemberService.getBrandMembers(member.getId(), brandId);
    }

    // 브랜드 멤버 추가 
    @PostMapping
    public void addBrandMember(
            @PathVariable Long brandId,
            @RequestBody BrandMemberRequestDTO request,
            @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        checkCompanyAdmin(member);

        brandMemberService.addBrandMember(
                member.getId(),
                brandId,
                request.getMemberId(),
                request.getBrandRole()
        );
    }

    //브랜드 멤버 역할 변경
    @PutMapping("/{memberId}")
    public void changeBrandMemberRole(
            @PathVariable Long brandId,
            @PathVariable Long memberId,
            @RequestBody BrandMemberRequestDTO request,
            @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        checkCompanyAdmin(member);

        brandMemberService.changeBrandMemberRole(
                member.getId(),
                brandId,
                memberId,
                request.getBrandRole()
        );
    }

    // 브랜드 멤버 제거
    @DeleteMapping("/{memberId}")
    public void removeBrandMember(
            @PathVariable Long brandId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        checkCompanyAdmin(member);

        brandMemberService.removeBrandMember(member.getId(), brandId, memberId);
    }
}
