package com.InsightMarket.controller;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.brand.BrandResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.brand.BrandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;
    private final MemberRepository memberRepository;

    //Brand 추가
    @PostMapping
    public Long createBrand(@RequestBody BrandRequestDTO request, @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        Company company = member.getCompany(); // 이미 가입된 회사 기준

        return brandService.createBrand(request, member, company);
    }
    
    //전체 Brands 리스트 조회
    @GetMapping
    public List<BrandResponseDTO> getList(@AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();
        return brandService.getMyBrands(member);
    }

    // 브랜드 상세 조회 (리스트 클릭 -> 상세 페이지용)
    // GET /api/brands/{brandId}
    @GetMapping("/{brandId}")
    public BrandResponseDTO getDetail(@PathVariable Long brandId, @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();

        return brandService.getBrandDetail(member, brandId);
    }

    // 브랜드 수정 (BRAND_ADMIN만 가능)
    @PutMapping("/{brandId}")
    public void updateBrand(@PathVariable Long brandId, @RequestBody BrandRequestDTO request, @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();

        // 권한 체크
        if (!brandService.isAdmin(member.getId(), brandId)) {
            throw new AccessDeniedException("권한이 없습니다. BRAND_ADMIN만 수정 가능");
        }

        brandService.updateBrand(brandId, request);
    }

    //브랜드 삭제 (BRAND_ADMIN만 가능)
    @DeleteMapping("/{brandId}")
    public void deleteBrand(@PathVariable Long brandId, @AuthenticationPrincipal MemberDTO memberDTO) {

        Member member = memberRepository.findByEmail(memberDTO.getEmail()).orElseThrow();

        // 권한 체크
        if (!brandService.isAdmin(member.getId(), brandId)) {
            throw new AccessDeniedException("권한이 없습니다. BRAND_ADMIN만 삭제 가능");
        }

        brandService.deleteBrand(brandId);
    }
}
