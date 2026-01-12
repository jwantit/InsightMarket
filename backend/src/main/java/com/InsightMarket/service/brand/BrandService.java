package com.InsightMarket.service.brand;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.brand.BrandResponseDTO;
import com.InsightMarket.dto.member.MemberDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BrandService {

    Long createBrand(BrandRequestDTO brandRequestDTO, Member member, Company company, MultipartFile imageFile);

    List<BrandResponseDTO> getMyBrands(Member member);

    BrandResponseDTO getBrandDetail(Member member, Long brandId);

    void updateBrand(Long brandId, BrandRequestDTO brandRequestDTO, Long memberId, MultipartFile imageFile);

    void deleteBrand(Long brandId);

    boolean isAdmin(Long memberId, Long brandId);
}
