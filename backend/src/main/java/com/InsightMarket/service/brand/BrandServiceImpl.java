package com.InsightMarket.service.brand;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.company.Competitor;
import com.InsightMarket.domain.keyword.CompetitorKeyword;
import com.InsightMarket.domain.keyword.Keyword;
import com.InsightMarket.domain.keyword.BrandKeyword;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.brand.BrandResponseDTO;
import com.InsightMarket.dto.competitor.CompetitorDTO;
import com.InsightMarket.dto.competitor.CompetitorResponseDTO;
import com.InsightMarket.repository.brand.BrandMemberRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.competitor.CompetitorRepository;
import com.InsightMarket.repository.keyword.BrandKeywordRepository;
import com.InsightMarket.repository.keyword.CompetitorKeywordRepository;
import com.InsightMarket.repository.keyword.KeywordRepository;
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
    private final KeywordRepository keywordRepository;
    private final BrandKeywordRepository brandKeywordRepository;
    private final CompetitorKeywordRepository competitorKeywordRepository;

    //브랜드 생성 + 생성자 BRAND_ADMIN 매핑
    @Override
    public Long createBrand(BrandRequestDTO request, Member member, Company company) {

        Brand brand = Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .company(company)
                .build();

        brandRepository.save(brand);

        //브랜드 키워드/경쟁사/경쟁사키워드 저장
        syncBrandKeywords(brand, request.getKeywords());
        syncCompetitors(brand, request.getCompetitors());

        BrandMember brandMember = BrandMember.builder()
                .brand(brand)
                .member(member)
                .brandRole(BrandRole.BRAND_ADMIN)
                .build();

        brandMemberRepository.save(brandMember);

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

        // 브랜드 키워드(Keyword까지 fetch) 한 번에
        List<BrandKeyword> brandKeywords = brandKeywordRepository.findByBrandInWithKeyword(brands);

        // brandId -> keywords(text)
        var brandIdToKeywords = brandKeywords.stream()
                .collect(Collectors.groupingBy(
                        bk -> bk.getBrand().getId(),
                        Collectors.mapping(bk -> bk.getKeyword().getText(), Collectors.toList())
                ));

        // [추가] 경쟁사 한 번에
        List<Competitor> competitors = competitorRepository.findByBrandIn(brands);

        // brandId -> competitors
        var brandIdToCompetitors = competitors.stream()
                .collect(Collectors.groupingBy(c -> c.getBrand().getId()));

        // 경쟁사 키워드(Keyword까지 fetch) 한 번에
        var competitorIdToKeywords = List.<CompetitorKeyword>of();
        if (!competitors.isEmpty()) {
            competitorIdToKeywords = competitorKeywordRepository.findByCompetitorInWithKeyword(competitors);
        }

        var competitorIdToKeywordTexts = competitorIdToKeywords.stream()
                .collect(Collectors.groupingBy(
                        ck -> ck.getCompetitor().getId(),
                        Collectors.mapping(ck -> ck.getKeyword().getText(), Collectors.toList())
                ));

        // [변경] 이제 N+1 없이 DTO 조립
        return brandMembers.stream()
                .map(bm -> {
                    Long brandId = bm.getBrand().getId();

                    var competitorDTOs = brandIdToCompetitors.getOrDefault(brandId, List.of()).stream()
                            .map(c -> CompetitorResponseDTO.builder()
                                    .competitorId(c.getId())
                                    .name(c.getName())
                                    .enabled(c.isEnabled())
                                    .keywords(competitorIdToKeywordTexts.getOrDefault(c.getId(), List.of()))
                                    .build()
                            )
                            .toList();

                    return BrandResponseDTO.builder()
                            .brandId(brandId)
                            .name(bm.getBrand().getName())
                            .description(bm.getBrand().getDescription())
                            .role(bm.getBrandRole().name())
                            .keywords(brandIdToKeywords.getOrDefault(brandId, List.of()))
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
                .orElseThrow(() -> new IllegalArgumentException("브랜드 접근 권한이 없습니다."));

        Brand brand = brandMember.getBrand();

        // 2) 브랜드 키워드 (Keyword fetch join)
        List<BrandKeyword> brandKeywords = brandKeywordRepository.findByBrandWithKeyword(brand);
        List<String> brandKeywordTexts = brandKeywords.stream()
                .map(bk -> bk.getKeyword().getText())
                .toList();

        // 3) 경쟁사 한 번에
        List<Competitor> competitors = competitorRepository.findByBrand(brand);

        // 4) 경쟁사 키워드 (competitor in (...) + keyword fetch join)
        final Map<Long, List<String>> competitorIdToKeywordTexts = new HashMap<>();

        if (!competitors.isEmpty()) {
            List<CompetitorKeyword> competitorKeywords =
                    competitorKeywordRepository.findByCompetitorInWithKeyword(competitors);

            Map<Long, List<String>> grouped = competitorKeywords.stream()
                    .collect(Collectors.groupingBy(
                            ck -> ck.getCompetitor().getId(),
                            Collectors.mapping(ck -> ck.getKeyword().getText(), Collectors.toList())
                    ));

            competitorIdToKeywordTexts.putAll(grouped); // ✅ 재할당 X
        }

        List<CompetitorResponseDTO> competitorDTOs = competitors.stream()
                .map(c -> CompetitorResponseDTO.builder()
                        .competitorId(c.getId())
                        .name(c.getName())
                        .enabled(c.isEnabled())
                        .keywords(competitorIdToKeywordTexts.getOrDefault(c.getId(), List.of()))
                        .build()
                )
                .collect(Collectors.toList());

        // 5) BrandResponseDTO 조립 (getMyBrands와 동일 필드 구성)
        return BrandResponseDTO.builder()
                .brandId(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .role(brandMember.getBrandRole().name())
                .keywords(brandKeywordTexts)
                .competitors(competitorDTOs)
                .build();
    }

    @Transactional
    @Override
    public void updateBrand(Long brandId, BrandRequestDTO brandRequestDTO) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("브랜드가 존재하지 않습니다."));

        brand.changeName(brandRequestDTO.getName());
        brand.changeDescription(brandRequestDTO.getDescription());

        //수정 시에도 키워드/경쟁사 동기화 (키워드는 추가/삭제, 경쟁사는 enable/disable)
        syncBrandKeywords(brand, brandRequestDTO.getKeywords());
        syncCompetitors(brand, brandRequestDTO.getCompetitors());

        brandRepository.save(brand);
    }

    @Override
    public void deleteBrand(Long brandId) {

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("브랜드가 존재하지 않습니다."));

        // 1) BrandKeyword 삭제
        brandKeywordRepository.deleteByBrand(brand);

        // 2) CompetitorKeyword 삭제 -> Competitor 먼저 가져와서 in 삭제
        List<Competitor> competitors = competitorRepository.findByBrand(brand);
        if (!competitors.isEmpty()) {
            competitorKeywordRepository.deleteByCompetitorIn(competitors);
        }

        // 3) Competitor 삭제
        competitorRepository.deleteByBrand(brand);

        // 4) BrandMember 삭제 (권한/참여 매핑)
        brandMemberRepository.deleteByBrand(brand);

        // 5) 마지막으로 Brand 삭제
        brandRepository.delete(brand);
    }

    @Override
    public boolean isAdmin(Long memberId, Long brandId) {

        return brandMemberRepository.findByMemberIdAndBrandId(memberId, brandId)
                .map(bm -> bm.getBrandRole() == BrandRole.BRAND_ADMIN)
                .orElse(false);
    }

    //키워드 정규화
    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ").toLowerCase();
    }

    private Keyword getOrCreateKeyword(String raw) {
        String text = normalize(raw);
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("keyword empty");
        }
        return keywordRepository.findByText(text)
                .orElseGet(() -> keywordRepository.save(Keyword.builder().text(text).build()));
    }

    //수정 화면에서 키워드 지우면 BrandKeyword row 삭제됨.
    private void syncBrandKeywords(Brand brand, List<String> keywords) {
        List<String> input = keywords == null ? List.of() : keywords;

        Set<String> inputTexts = input.stream()
                .map(this::normalize)
                .filter(t -> t != null && !t.isBlank())
                .collect(Collectors.toSet());

        // 기존 BrandKeyword 전부 로드
        List<BrandKeyword> existing = brandKeywordRepository.findByBrandWithKeyword(brand);
        // ↑ 없으면 findByBrand(brand) + keyword LAZY면 fetch join 메서드 하나 추가 추천

        // 요청에 없는 키워드는 row 삭제
        for (BrandKeyword bk : existing) {
            String text = bk.getKeyword().getText(); // text는 normalize로 저장되고 있으니 그대로 비교 가능
            if (!inputTexts.contains(text)) {
                brandKeywordRepository.delete(bk);
            }
        }

        // 요청에 있는 키워드는 없으면 추가
        Set<String> existingTexts = existing.stream()
                .map(bk -> bk.getKeyword().getText())
                .collect(Collectors.toSet());

        for (String t : inputTexts) {
            if (existingTexts.contains(t)) continue;
            Keyword keyword = getOrCreateKeyword(t);
            brandKeywordRepository.save(
                    BrandKeyword.builder()
                            .brand(brand)
                            .keyword(keyword)
                            .enabled(true) // 의미 없지만 컬럼 있으니 유지
                            .build()
            );
        }
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
            // FK 때문에 키워드 먼저 삭제
            competitorKeywordRepository.deleteByCompetitorIn(toDelete);

            // competitor 삭제 (배치 권장)
            List<Long> deleteIds = toDelete.stream().map(Competitor::getId).toList();
            competitorRepository.deleteAllByIdInBatch(deleteIds);
        }

        // 4) 요청 항목 처리: update or create
        for (CompetitorDTO dto : input) {
            Long id = dto.getCompetitorId();

            Competitor competitor;
            if (id != null) {
                competitor = existingById.get(id);
                if (competitor == null) {
                    // 다른 브랜드 competitorId로 삭제하는거 방지
                    throw new IllegalArgumentException("잘못된 competitorId 입니다: " + id);
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

            // 경쟁사 키워드도 동기화(삭제 포함)
            syncCompetitorKeywords(competitor, dto.getKeywords());
        }
    }

    // competitorKeyword.enabled 는 전부 true로만 운영 (여기서 추가/삭제)
    private void syncCompetitorKeywords(Competitor competitor, List<String> keywords) {
        List<String> input = keywords == null ? List.of() : keywords;

        Set<String> inputTexts = input.stream()
                .map(this::normalize)
                .filter(t -> t != null && !t.isBlank())
                .collect(Collectors.toSet());

        List<CompetitorKeyword> existing = competitorKeywordRepository.findByCompetitorWithKeyword(competitor);

        // 요청에 없는 키워드 row 삭제
        for (CompetitorKeyword ck : existing) {
            String text = ck.getKeyword().getText();
            if (!inputTexts.contains(text)) {
                competitorKeywordRepository.delete(ck);
            }
        }

        Set<String> existingTexts = existing.stream()
                .map(ck -> ck.getKeyword().getText())
                .collect(Collectors.toSet());

        // 요청에 있는 키워드 없으면 추가
        for (String t : inputTexts) {
            if (existingTexts.contains(t)) continue;
            Keyword keyword = getOrCreateKeyword(t);
            competitorKeywordRepository.save(
                    CompetitorKeyword.builder()
                            .competitor(competitor)
                            .keyword(keyword)
                            .enabled(true) // 의미 없지만 컬럼 유지
                            .build()
            );
        }
    }
}
