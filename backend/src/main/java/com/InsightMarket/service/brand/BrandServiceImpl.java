package com.InsightMarket.service.brand;

import com.InsightMarket.ai.PythonClient;
import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.company.Competitor;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.brand.BrandResponseDTO;
import com.InsightMarket.dto.competitor.CompetitorDTO;
import com.InsightMarket.dto.competitor.CompetitorResponseDTO;
import com.InsightMarket.repository.brand.BrandMemberRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.competitor.CompetitorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final BrandMemberRepository brandMemberRepository;
    private final CompetitorRepository competitorRepository;
    private final PythonClient pythonClient;

    //브랜드 생성 + 생성자 BRAND_ADMIN 매핑
    @Override
    public Long createBrand(BrandRequestDTO request, Member member, Company company) {

        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .company(company)
                .build();

        brandRepository.save(brand);

        //경쟁사 저장
        syncCompetitors(brand, request.getCompetitors());

        BrandMember brandMember = BrandMember.builder()
                .brand(brand)
                .member(member)
                .brandRole(BrandRole.BRAND_ADMIN)
                .build();

        brandMemberRepository.save(brandMember);
        
        // 브랜드 생성 시 재수집 호출
        pythonClient.recollect("BRAND", brand.getId(), brand.getName(), brand.getId(), brand.getName());

        return brand.getId();
    }

    //내가 속한 브랜드 리스트 조회
    @Override
    public List<BrandResponseDTO> getMyBrands(Member member) {

        // BrandMember + Brand를 fetch join으로 한 번에 로딩
        List<BrandMember> brandMembers = brandMemberRepository.findByMemberWithBrand(member);

        List<Brand> brands = brandMembers.stream()
                .map(BrandMember::getBrand)
                .toList();

        if (brands.isEmpty()) {
            return List.of();
        }

        // 경쟁사 한 번에 조회
        List<Competitor> competitors = competitorRepository.findByBrandIn(brands);

        // brandId -> competitors
        var brandIdToCompetitors = competitors.stream()
                .collect(Collectors.groupingBy(c -> c.getBrand().getId()));

        // [변경] 이제 N+1 없이 DTO 조립
        return brandMembers.stream()
                .map(bm -> {
                    Long brandId = bm.getBrand().getId();

                    var competitorDTOs = brandIdToCompetitors.getOrDefault(brandId, List.of()).stream()
                            .map(c -> CompetitorResponseDTO.builder()
                                    .competitorId(c.getId())
                                    .name(c.getName())
                                    .enabled(c.isEnabled())
                                    .keywords(List.of()) // 키워드 기능 제거
                                    .build()
                            )
                            .toList();

                    return BrandResponseDTO.builder()
                            .brandId(brandId)
                            .name(bm.getBrand().getName())
                            .description(bm.getBrand().getDescription())
                            .role(bm.getBrandRole().name())
                            .keywords(List.of()) // 키워드 기능 제거
                            .competitors(competitorDTOs)
                            .build();
                })
                .toList();
    }

    //브랜드 상세 조회
    @Override
    public BrandResponseDTO getBrandDetail(Member member, Long brandId) {

        // 1) 이 멤버가 해당 브랜드에 속해있는지 확인 + role 가져오기
        BrandMember brandMember = brandMemberRepository.findByMemberIdAndBrandId(member.getId(), brandId)
                .orElseThrow(() ->  new ApiException(ErrorCode.ACCESS_DENIED));

        Brand brand = brandMember.getBrand();

        // 경쟁사 한 번에
        List<Competitor> competitors = competitorRepository.findByBrand(brand);

        List<CompetitorResponseDTO> competitorDTOs = competitors.stream()
                .map(c -> CompetitorResponseDTO.builder()
                        .competitorId(c.getId())
                        .name(c.getName())
                        .enabled(c.isEnabled())
                        .keywords(List.of()) // 키워드 기능 제거
                        .build()
                )
                .collect(Collectors.toList());

        // BrandResponseDTO 조립
        return BrandResponseDTO.builder()
                .brandId(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .role(brandMember.getBrandRole().name())
                .keywords(List.of()) // 키워드 기능 제거
                .competitors(competitorDTOs)
                .build();
    }

    @Transactional
    @Override
    public void updateBrand(Long brandId, BrandRequestDTO brandRequestDTO) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));

        brand.changeName(brandRequestDTO.getName());
        brand.changeDescription(brandRequestDTO.getDescription());

        //수정 시에도 경쟁사 동기화
        syncCompetitors(brand, brandRequestDTO.getCompetitors());

        brandRepository.save(brand);
    }

    @Override
    public void deleteBrand(Long brandId) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));

        // Competitor 삭제
        competitorRepository.deleteByBrand(brand);

        // BrandMember 삭제 (권한/참여 매핑)
        brandMemberRepository.deleteByBrand(brand);

        // 마지막으로 Brand 삭제
        brandRepository.delete(brand);
    }

    @Override
    public boolean isAdmin(Long memberId, Long brandId) {

        return brandMemberRepository.findByMemberIdAndBrandId(memberId, brandId)
                .map(bm -> bm.getBrandRole() == BrandRole.BRAND_ADMIN)
                .orElse(false);
    }


    private void syncCompetitors(Brand brand, List<CompetitorDTO> competitorDTOs) {

        List<CompetitorDTO> input = (competitorDTOs == null) ? List.of() : competitorDTOs;

        // 1) 기존 경쟁사 로드
        List<Competitor> existing = competitorRepository.findByBrand(brand);

        Map<Long, Competitor> existingById = existing.stream()
                .filter(c -> c.getId() != null)
                .collect(Collectors.toMap(Competitor::getId, c -> c));

        // 2) 요청에 포함된 competitorId
        Set<Long> inputIds = input.stream()
                .map(CompetitorDTO::getCompetitorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // 3) 요청에 없는 기존 competitorId = 삭제 대상
        List<Competitor> toDelete = existing.stream()
                .filter(c -> c.getId() != null && !inputIds.contains(c.getId()))
                .toList();

        if (!toDelete.isEmpty()) {
            // competitor 삭제 (배치 권장)
            List<Long> deleteIds = toDelete.stream().map(Competitor::getId).toList();
            competitorRepository.deleteAllByIdInBatch(deleteIds);
        }

        // 4) 요청 항목 처리: update or create
        for (CompetitorDTO dto : input) {
            Long id = dto.getCompetitorId();
            boolean isNew = (id == null);

            Competitor competitor;
            if (id != null) {
                competitor = existingById.get(id);
                if (competitor == null) {
                    // 다른 브랜드 competitorId로 삭제하는거 방지
                    throw new ApiException(ErrorCode.COMPETITOR_NOT_FOUND);
                }
            } else {
                competitor = Competitor.builder()
                        .brand(brand)
                        .name(dto.getName())
                        .enabled(dto.isEnabled())
                        .build();
                competitorRepository.save(competitor);
            }

            competitor.changeName(dto.getName());
            competitor.changeEnabled(dto.isEnabled());
            
            // 신규 생성 시에만 재수집 호출
            if (isNew) {
                pythonClient.recollect("COMPETITOR", competitor.getId(), competitor.getName(), brand.getId(), brand.getName());
            }
        }
    }
}
