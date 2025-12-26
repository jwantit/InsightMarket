package com.InsightMarket.service.brand;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.brand.BrandResponseDTO;
import com.InsightMarket.repository.brand.BrandMemberRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMemberRepository brandMemberRepository;

    //브랜드 생성 + 생성자 BRAND_ADMIN 매핑
    @Override
    public Long createBrand(BrandRequestDTO request, Member member, Company company) {

        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .company(company)
                .build();

        brandRepository.save(brand);

        BrandMember brandMember = BrandMember.builder()
                .brand(brand)
                .member(member)
                .brandRole(BrandRole.BRAND_ADMIN)
                .build();

        brandMemberRepository.save(brandMember);

        return brand.getId();
    }

    //내가 속한 브랜드 조회
    @Override
    public List<BrandResponseDTO> getMyBrands(Member member) {

        return brandMemberRepository.findByMember(member)
                .stream()
                .map(bm -> BrandResponseDTO.builder()
                        .brandId(bm.getBrand().getId())
                        .name(bm.getBrand().getName())
                        .description(bm.getBrand().getDescription())
                        .role(bm.getBrandRole().name())
                        .build()
                )
                .toList();
    }

    @Override
    public void updateBrand(Long brandId, BrandRequestDTO brandRequestDTO) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("브랜드가 존재하지 않습니다."));

        brand.changeName(brandRequestDTO.getName());
        brand.changeDescription(brandRequestDTO.getDescription());

        brandRepository.save(brand);
    }

    @Override
    public void deleteBrand(Long brandId) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("브랜드가 존재하지 않습니다."));

        brandRepository.delete(brand);
    }

    @Override
    public boolean isAdmin(Long memberId, Long brandId) {

        return brandMemberRepository.findByMemberIdAndBrandId(memberId, brandId)
                .map(bm -> bm.getBrandRole() == BrandRole.BRAND_ADMIN)
                .orElse(false);
    }
}
