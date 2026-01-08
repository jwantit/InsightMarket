package com.InsightMarket.repository;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.brand.BrandMember;
import com.InsightMarket.domain.brand.BrandRole;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.domain.keyword.ProjectKeyword;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.company.Competitor;
import com.InsightMarket.domain.strategy.Strategy;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.domain.order.Orders;
import com.InsightMarket.domain.order.OrderItem;
import com.InsightMarket.domain.order.OrderStatus;
import com.InsightMarket.repository.company.CompanyRepository;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.brand.BrandMemberRepository;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.keyword.ProjectKeywordRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.community.CommentRepository;
import com.InsightMarket.repository.competitor.CompetitorRepository;
import com.InsightMarket.repository.strategy.StrategyRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.repository.payment.PaymentRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 시연용 통합 더미 데이터 생성 테스트
 * 한 번 실행으로 모든 시연용 더미 데이터 생성
 */
@SpringBootTest
@Log4j2
@Transactional
public class DemoDummyDataTests {

    @Autowired
    private CompanyRepository companyRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private BrandMemberRepository brandMemberRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectKeywordRepository projectKeywordRepository;
    @Autowired
    private BoardRepository boardRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private CompetitorRepository competitorRepository;
    @Autowired
    private StrategyRepository strategyRepository;
    @Autowired
    private SolutionRepository solutionRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Commit
    public void createAllDemoDummyData() {
        log.info("=== 시연용 더미 데이터 생성 시작 ===");

        // 1단계: Company 생성
        List<Company> companies = createCompanies();

        // 2단계: Brand 생성 (Company 필요)
        List<Brand> brands = createBrands(companies);

        // 2-1단계: Competitor 생성 (Brand 필요)
        createCompetitors(brands);

        // 3단계: Member 생성 (Company 필요)
        List<Member> members = createMembers(companies);

        // 4단계: BrandMember 매핑 (Brand, Member 필요)
        createBrandMembers(members, brands);

        // 5단계: Project 생성 (Brand 필요)
        createProjects(brands);

        // 5-1단계: ProjectKeyword 생성 (Project 필요)
        createProjectKeywords(brands);

        // 6단계: Board/Comment 생성 (Brand, Member 필요)
        createBoardsAndComments(brands, members);

        // 7단계: Strategy 생성 (독립적)
        List<Strategy> strategies = createStrategies();

        // 8단계: Solution 생성 (Project, Strategy 필요)
        List<Solution> solutions = createSolutions(brands, strategies);

        // 9단계: Orders/Payment 생성 (Member, Solution 필요)
        createOrders(members, solutions);

        log.info("=== 시연용 더미 데이터 생성 완료 ===");
    }

    /**
     * 1단계: Company 생성
     * - 스타벅스 (id=1)
     * - 나이키 (id=2)
     */
    private List<Company> createCompanies() {
        log.info("--- 1단계: Company 생성 시작 ---");

        List<Company> companies = new ArrayList<>();
        
        // 스타벅스 회사 확인 또는 생성
        Company starbucks = companyRepository.findAll().stream()
                .filter(c -> "스타벅스".equals(c.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .name("스타벅스")
                            .build();
                    return companyRepository.save(newCompany);
                });
        companies.add(starbucks);
        log.info("스타벅스 회사: id={} {}", starbucks.getId(), 
                starbucks.getId() != null ? "(기존)" : "(신규)");

        // 나이키 회사 확인 또는 생성
        Company nike = companyRepository.findAll().stream()
                .filter(c -> "나이키".equals(c.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .name("나이키")
                            .build();
                    return companyRepository.save(newCompany);
                });
        companies.add(nike);
        log.info("나이키 회사: id={} {}", nike.getId(), 
                nike.getId() != null ? "(기존)" : "(신규)");

        log.info("Company 생성 완료: 스타벅스(id={}), 나이키(id={})", 
                starbucks.getId(), nike.getId());
        return companies;
    }

    /**
     * 2단계: Brand 생성
     * - 스타벅스 회사에 스타벅스 브랜드
     * - 나이키 회사에 나이키 브랜드
     */
    private List<Brand> createBrands(List<Company> companies) {
        log.info("--- 2단계: Brand 생성 시작 ---");

        Company starbucksCompany = companies.stream()
                .filter(c -> "스타벅스".equals(c.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 회사가 생성되지 않았습니다."));

        Company nikeCompany = companies.stream()
                .filter(c -> "나이키".equals(c.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 회사가 생성되지 않았습니다."));

        // 스타벅스 브랜드 확인 또는 생성 (Company ID로 정확히 매칭)
        Brand starbucksBrand = brandRepository.findAll().stream()
                .filter(b -> "스타벅스".equals(b.getName()) && 
                            b.getCompany() != null &&
                            b.getCompany().getId().equals(starbucksCompany.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Brand newBrand = Brand.builder()
                            .name("스타벅스")
                            .description("스타벅스 공식 브랜드")
                            .company(starbucksCompany)
                            .build();
                    return brandRepository.save(newBrand);
                });

        // 나이키 브랜드 확인 또는 생성 (Company ID로 정확히 매칭)
        Brand nikeBrand = brandRepository.findAll().stream()
                .filter(b -> "나이키".equals(b.getName()) && 
                            b.getCompany() != null &&
                            b.getCompany().getId().equals(nikeCompany.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Brand newBrand = Brand.builder()
                            .name("나이키")
                            .description("나이키 공식 브랜드")
                            .company(nikeCompany)
                            .build();
                    return brandRepository.save(newBrand);
                });

        log.info("Brand 생성 완료: 스타벅스(id={}), 나이키(id={})",
                starbucksBrand.getId(), nikeBrand.getId());
        
        return List.of(starbucksBrand, nikeBrand);
    }

    /**
     * 2-1단계: Competitor 생성
     * 스타벅스 브랜드: 빽다방, 이디야
     * 나이키 브랜드: 아디다스
     */
    private void createCompetitors(List<Brand> brands) {
        log.info("--- 2-1단계: Competitor 생성 시작 ---");

        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        List<Competitor> competitors = new ArrayList<>();

        // 스타벅스 브랜드 경쟁사
        String[] starbucksCompetitors = {"빽다방", "이디야"};
        for (String competitorName : starbucksCompetitors) {
            // 기존 경쟁사 확인
            Competitor existingCompetitor = competitorRepository.findByBrand(starbucksBrand).stream()
                    .filter(c -> competitorName.equals(c.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingCompetitor != null) {
                log.debug("기존 경쟁사 사용: {} - {}", starbucksBrand.getName(), competitorName);
                continue;
            }

            Competitor competitor = Competitor.builder()
                    .brand(starbucksBrand)
                    .name(competitorName)
                    .enabled(true)
                    .build();

            competitors.add(competitor);
        }

        // 나이키 브랜드 경쟁사
        String[] nikeCompetitors = {"아디다스"};
        for (String competitorName : nikeCompetitors) {
            // 기존 경쟁사 확인
            Competitor existingCompetitor = competitorRepository.findByBrand(nikeBrand).stream()
                    .filter(c -> competitorName.equals(c.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingCompetitor != null) {
                log.debug("기존 경쟁사 사용: {} - {}", nikeBrand.getName(), competitorName);
                continue;
            }

            Competitor competitor = Competitor.builder()
                    .brand(nikeBrand)
                    .name(competitorName)
                    .enabled(true)
                    .build();

            competitors.add(competitor);
        }

        if (!competitors.isEmpty()) {
            competitorRepository.saveAll(competitors);
            log.info("Competitor 신규 생성: {}개", competitors.size());
        }

        long starbucksCompetitorCount = competitorRepository.findByBrand(starbucksBrand).size();
        long nikeCompetitorCount = competitorRepository.findByBrand(nikeBrand).size();

        log.info("Competitor 생성 완료: 스타벅스 {}개, 나이키 {}개",
                starbucksCompetitorCount, nikeCompetitorCount);
    }

    /**
     * 3단계: Member 생성
     * 각 회사에 20명씩 생성 (총 40명)
     * - 1~5: USER
     * - 6~8: COMPANY_ADMIN
     * - 9~0 (9~10): ADMIN
     */
    private List<Member> createMembers(List<Company> companies) {
        log.info("--- 3단계: Member 생성 시작 ---");

        Company starbucksCompany = companies.stream()
                .filter(c -> "스타벅스".equals(c.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 회사가 생성되지 않았습니다."));

        Company nikeCompany = companies.stream()
                .filter(c -> "나이키".equals(c.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 회사가 생성되지 않았습니다."));

        // 한국 이름 리스트 (20개)
        String[] koreanNames = {
                "김민수", "이지은", "박준호", "최수진", "정다은",
                "강태영", "윤서연", "장현우", "임하늘", "한소영",
                "오동현", "신미래", "조성민", "배지훈", "홍예린",
                "송민준", "유서아", "문지원", "양태준", "노하은"
        };

        String password = passwordEncoder.encode("test12345!");

        List<Member> members = new ArrayList<>();

        // 스타벅스 회사 멤버 20명 생성
        for (int i = 1; i <= 20; i++) {
            String email = "starbucks" + i + "@aaa.com";
            
            // 기존 멤버 확인
            Member existingMember = memberRepository.findByEmail(email).orElse(null);
            if (existingMember != null) {
                members.add(existingMember);
                log.debug("기존 멤버 사용: {}", email);
                continue;
            }

            SystemRole role = SystemRole.USER;
            boolean approved = false;
            Company requestedCompany = starbucksCompany;

            // 6~8: COMPANY_ADMIN
            if (i >= 6 && i <= 8) {
                role = SystemRole.COMPANY_ADMIN;
                approved = true;
            }
            // 9~10: ADMIN (운영자)
            else if (i >= 9 && i <= 10) {
                role = SystemRole.ADMIN;
                approved = true;
                requestedCompany = null;
            }
            // 1~5: USER (승인 필요)
            else {
                approved = false;
            }

            Member member = Member.builder()
                    .email(email)
                    .password(password)
                    .name(koreanNames[i - 1])
                    .systemRole(role)
                    .isApproved(approved)
                    .isExpired(false)
                    .isSocial(false)
                    .requestedCompany(requestedCompany)
                    .company(approved ? requestedCompany : null)
                    .build();

            members.add(member);
        }

        // 나이키 회사 멤버 20명 생성
        for (int i = 1; i <= 20; i++) {
            String email = "nike" + i + "@aaa.com";
            
            // 기존 멤버 확인
            Member existingMember = memberRepository.findByEmail(email).orElse(null);
            if (existingMember != null) {
                members.add(existingMember);
                log.debug("기존 멤버 사용: {}", email);
                continue;
            }

            SystemRole role = SystemRole.USER;
            boolean approved = false;
            Company requestedCompany = nikeCompany;

            // 6~8: COMPANY_ADMIN
            if (i >= 6 && i <= 8) {
                role = SystemRole.COMPANY_ADMIN;
                approved = true;
            }
            // 9~10: ADMIN (운영자)
            else if (i >= 9 && i <= 10) {
                role = SystemRole.ADMIN;
                approved = true;
                requestedCompany = null;
            }
            // 1~5: USER (승인 필요)
            else {
                approved = false;
            }

            Member member = Member.builder()
                    .email(email)
                    .password(password)
                    .name(koreanNames[i - 1])
                    .systemRole(role)
                    .isApproved(approved)
                    .isExpired(false)
                    .isSocial(false)
                    .requestedCompany(requestedCompany)
                    .company(approved ? requestedCompany : null)
                    .build();

            members.add(member);
        }

        // 새로 생성할 멤버만 저장
        List<Member> newMembers = members.stream()
                .filter(m -> m.getId() == null)
                .toList();
        
        if (!newMembers.isEmpty()) {
            memberRepository.saveAll(newMembers);
            log.info("Member 신규 생성: {}명", newMembers.size());
        }
        
        log.info("Member 생성 완료: 총 {}명 (스타벅스 20명, 나이키 20명)", members.size());
        return members;
    }

    /**
     * 4단계: BrandMember 매핑
     * 각 브랜드별로 BRAND_ADMIN 4명씩 (USER에서 2명, COMPANY_ADMIN에서 2명)
     * 나머지는 일반 멤버(MARKETER)로 연결
     */
    private void createBrandMembers(List<Member> members, List<Brand> brands) {
        log.info("--- 4단계: BrandMember 매핑 시작 ---");

        // Brand 조회 (파라미터로 받은 brands 사용)
        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        // 스타벅스 회사 멤버 필터링 (starbucks1@aaa.com ~ starbucks20@aaa.com)
        List<Member> starbucksMembers = members.stream()
                .filter(m -> m.getEmail().startsWith("starbucks"))
                .sorted((m1, m2) -> {
                    String email1 = m1.getEmail();
                    String email2 = m2.getEmail();
                    int num1 = Integer.parseInt(email1.substring(9, email1.indexOf("@")));
                    int num2 = Integer.parseInt(email2.substring(9, email2.indexOf("@")));
                    return Integer.compare(num1, num2);
                })
                .toList();

        // 나이키 회사 멤버 필터링 (nike1@aaa.com ~ nike20@aaa.com)
        List<Member> nikeMembers = members.stream()
                .filter(m -> m.getEmail().startsWith("nike"))
                .sorted((m1, m2) -> {
                    String email1 = m1.getEmail();
                    String email2 = m2.getEmail();
                    int num1 = Integer.parseInt(email1.substring(4, email1.indexOf("@")));
                    int num2 = Integer.parseInt(email2.substring(4, email2.indexOf("@")));
                    return Integer.compare(num1, num2);
                })
                .toList();

        List<BrandMember> brandMembers = new ArrayList<>();

        // 스타벅스 브랜드 매핑
        for (int i = 0; i < starbucksMembers.size(); i++) {
            Member member = starbucksMembers.get(i);
            int memberNum = i + 1; // 1~20

            // 기존 BrandMember 확인
            if (brandMemberRepository.existsByBrandIdAndMemberId(starbucksBrand.getId(), member.getId())) {
                log.debug("기존 BrandMember 건너뜀: 스타벅스 브랜드 - {}", member.getEmail());
                continue;
            }

            BrandRole brandRole;
            // BRAND_ADMIN: USER 2명 (1~2번), COMPANY_ADMIN 2명 (6~7번)
            if ((memberNum >= 1 && memberNum <= 2 && member.getSystemRole() == SystemRole.USER) ||
                (memberNum >= 6 && memberNum <= 7 && member.getSystemRole() == SystemRole.COMPANY_ADMIN)) {
                brandRole = BrandRole.BRAND_ADMIN;
            } else {
                brandRole = BrandRole.MARKETER;
            }

            BrandMember brandMember = BrandMember.builder()
                    .brand(starbucksBrand)
                    .member(member)
                    .brandRole(brandRole)
                    .build();

            brandMembers.add(brandMember);
        }

        // 나이키 브랜드 매핑
        for (int i = 0; i < nikeMembers.size(); i++) {
            Member member = nikeMembers.get(i);
            int memberNum = i + 1; // 1~20

            // 기존 BrandMember 확인
            if (brandMemberRepository.existsByBrandIdAndMemberId(nikeBrand.getId(), member.getId())) {
                log.debug("기존 BrandMember 건너뜀: 나이키 브랜드 - {}", member.getEmail());
                continue;
            }

            BrandRole brandRole;
            // BRAND_ADMIN: USER 2명 (1~2번), COMPANY_ADMIN 2명 (6~7번)
            if ((memberNum >= 1 && memberNum <= 2 && member.getSystemRole() == SystemRole.USER) ||
                (memberNum >= 6 && memberNum <= 7 && member.getSystemRole() == SystemRole.COMPANY_ADMIN)) {
                brandRole = BrandRole.BRAND_ADMIN;
            } else {
                brandRole = BrandRole.MARKETER;
            }

            BrandMember brandMember = BrandMember.builder()
                    .brand(nikeBrand)
                    .member(member)
                    .brandRole(brandRole)
                    .build();

            brandMembers.add(brandMember);
        }

        if (!brandMembers.isEmpty()) {
            brandMemberRepository.saveAll(brandMembers);
            log.info("BrandMember 신규 생성: {}명", brandMembers.size());
        }

        // 전체 통계 계산 (기존 + 신규)
        long starbucksAdminCount = brandMemberRepository.findByBrandId(starbucksBrand.getId()).stream()
                .filter(bm -> bm.getBrandRole() == BrandRole.BRAND_ADMIN)
                .count();
        long nikeAdminCount = brandMemberRepository.findByBrandId(nikeBrand.getId()).stream()
                .filter(bm -> bm.getBrandRole() == BrandRole.BRAND_ADMIN)
                .count();

        log.info("BrandMember 매핑 완료: 총 {}명", 
                brandMemberRepository.findByBrandId(starbucksBrand.getId()).size() + 
                brandMemberRepository.findByBrandId(nikeBrand.getId()).size());
        log.info("  - 스타벅스: BRAND_ADMIN {}명, MARKETER {}명", 
                starbucksAdminCount, 
                brandMemberRepository.findByBrandId(starbucksBrand.getId()).size() - starbucksAdminCount);
        log.info("  - 나이키: BRAND_ADMIN {}명, MARKETER {}명", 
                nikeAdminCount, 
                brandMemberRepository.findByBrandId(nikeBrand.getId()).size() - nikeAdminCount);
    }

    /**
     * 5단계: Project 생성
     * 스타벅스 브랜드: "NEW YEAR 프로모션", "프렌즈 프로모션"
     * 나이키 브랜드: "대학생 할인 프로그램", "신발 세일 이벤트"
     */
    private void createProjects(List<Brand> brands) {
        log.info("--- 5단계: Project 생성 시작 ---");

        // Brand 조회 (파라미터로 받은 brands 사용)
        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        // 프로젝트 날짜 통일: 2026-01-01 ~ 2026-03-31
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 3, 31);

        List<Project> projects = new ArrayList<>();
        List<Project> existingProjectsToUpdate = new ArrayList<>();

        // 스타벅스 브랜드 프로젝트 생성
        String[] starbucksProjectNames = {"NEW YEAR 프로모션", "프렌즈 프로모션"};
        for (String projectName : starbucksProjectNames) {
            // 기존 프로젝트 확인
            Project existingProject = projectRepository.findByBrandIdProject(starbucksBrand.getId()).stream()
                    .filter(p -> projectName.equals(p.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingProject != null) {
                // 기존 프로젝트의 날짜 업데이트
                existingProject.changeInfo(existingProject.getName(), startDate, endDate);
                existingProjectsToUpdate.add(existingProject);
                log.debug("기존 프로젝트 날짜 업데이트: {} - {}", starbucksBrand.getName(), projectName);
                continue;
            }

            Project project = Project.builder()
                    .brand(starbucksBrand)
                    .name(projectName)
                    .startDate(startDate)
                    .endDate(endDate)
                    .build();

            projects.add(project);
        }

        // 나이키 브랜드 프로젝트 생성
        String[] nikeProjectNames = {"대학생 할인 프로그램", "신발 세일 이벤트"};
        for (String projectName : nikeProjectNames) {
            // 기존 프로젝트 확인
            Project existingProject = projectRepository.findByBrandIdProject(nikeBrand.getId()).stream()
                    .filter(p -> projectName.equals(p.getName()))
                    .findFirst()
                    .orElse(null);

            if (existingProject != null) {
                // 기존 프로젝트의 날짜 업데이트
                existingProject.changeInfo(existingProject.getName(), startDate, endDate);
                existingProjectsToUpdate.add(existingProject);
                log.debug("기존 프로젝트 날짜 업데이트: {} - {}", nikeBrand.getName(), projectName);
                continue;
            }

            Project project = Project.builder()
                    .brand(nikeBrand)
                    .name(projectName)
                    .startDate(startDate)
                    .endDate(endDate)
                    .build();

            projects.add(project);
        }

        if (!projects.isEmpty()) {
            projectRepository.saveAll(projects);
            log.info("Project 신규 생성: {}개", projects.size());
        }

        if (!existingProjectsToUpdate.isEmpty()) {
            projectRepository.saveAll(existingProjectsToUpdate);
            log.info("Project 날짜 업데이트: {}개", existingProjectsToUpdate.size());
        }

        long starbucksProjectCount = projectRepository.findByBrandIdProject(starbucksBrand.getId()).size();
        long nikeProjectCount = projectRepository.findByBrandIdProject(nikeBrand.getId()).size();

        log.info("Project 생성 완료: 스타벅스 {}개, 나이키 {}개", 
                starbucksProjectCount, nikeProjectCount);
    }

    /**
     * 5-1단계: ProjectKeyword 생성
     * 스타벅스 브랜드: "NEW YEAR 프로모션" -> "더블 에스프레소 크림 라떼", "유자 배 캐모마일 티", "붉은말 당근밭 케이크", "루나 뉴이어 블렌드"
     * 스타벅스 브랜드: "프렌즈 프로모션" -> "프렌즈 얼 그레이 베리 티 라떼", "프렌즈 시나몬 돌체폼 카푸치노", "프렌즈 엎어진 치즈 케이크", "프렌즈 라구 미트볼 샌드위치"
     * 나이키 브랜드: "대학생 할인 프로그램" -> "대학생 할인", "신발", "의류", "용품"
     * 나이키 브랜드: "신발 세일 이벤트" -> "에어 맥스", "에어 조던", "런닝화"
     */
    private void createProjectKeywords(List<Brand> brands) {
        log.info("--- 5-1단계: ProjectKeyword 생성 시작 ---");

        // Brand 조회 (파라미터로 받은 brands 사용)
        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        List<ProjectKeyword> projectKeywords = new ArrayList<>();

        // 스타벅스 브랜드 프로젝트 키워드 생성
        // "NEW YEAR 프로모션" 프로젝트
        Project newYearProject = projectRepository.findByBrandIdProject(starbucksBrand.getId()).stream()
                .filter(p -> "NEW YEAR 프로모션".equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("NEW YEAR 프로모션 프로젝트가 생성되지 않았습니다."));

        String[] newYearKeywords = {"더블 에스프레소 크림 라떼", "유자 배 캐모마일 티", "붉은말 당근밭 케이크", "루나 뉴이어 블렌드"};
        for (String keyword : newYearKeywords) {
            // 기존 키워드 확인
            if (projectKeywordRepository.findByProjectIdAndKeyword(newYearProject.getId(), keyword).isPresent()) {
                log.debug("기존 키워드 건너뜀: {} - {}", newYearProject.getName(), keyword);
                continue;
            }

            ProjectKeyword projectKeyword = ProjectKeyword.builder()
                    .brand(starbucksBrand)
                    .project(newYearProject)
                    .keyword(keyword)
                    .enabled(true)
                    .build();

            projectKeywords.add(projectKeyword);
        }

        // "프렌즈 프로모션" 프로젝트
        Project friendsProject = projectRepository.findByBrandIdProject(starbucksBrand.getId()).stream()
                .filter(p -> "프렌즈 프로모션".equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("프렌즈 프로모션 프로젝트가 생성되지 않았습니다."));

        String[] friendsKeywords = {"프렌즈 얼 그레이 베리 티 라떼", "프렌즈 시나몬 돌체폼 카푸치노", "프렌즈 엎어진 치즈 케이크", "프렌즈 라구 미트볼 샌드위치"};
        for (String keyword : friendsKeywords) {
            // 기존 키워드 확인
            if (projectKeywordRepository.findByProjectIdAndKeyword(friendsProject.getId(), keyword).isPresent()) {
                log.debug("기존 키워드 건너뜀: {} - {}", friendsProject.getName(), keyword);
                continue;
            }

            ProjectKeyword projectKeyword = ProjectKeyword.builder()
                    .brand(starbucksBrand)
                    .project(friendsProject)
                    .keyword(keyword)
                    .enabled(true)
                    .build();

            projectKeywords.add(projectKeyword);
        }

        // 나이키 브랜드 프로젝트 키워드 생성
        // "대학생 할인 프로그램" 프로젝트
        Project studentDiscountProject = projectRepository.findByBrandIdProject(nikeBrand.getId()).stream()
                .filter(p -> "대학생 할인 프로그램".equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("대학생 할인 프로그램 프로젝트가 생성되지 않았습니다."));

        String[] studentDiscountKeywords = {"대학생 할인", "신발", "의류", "용품"};
        for (String keyword : studentDiscountKeywords) {
            // 기존 키워드 확인
            if (projectKeywordRepository.findByProjectIdAndKeyword(studentDiscountProject.getId(), keyword).isPresent()) {
                log.debug("기존 키워드 건너뜀: {} - {}", studentDiscountProject.getName(), keyword);
                continue;
            }

            ProjectKeyword projectKeyword = ProjectKeyword.builder()
                    .brand(nikeBrand)
                    .project(studentDiscountProject)
                    .keyword(keyword)
                    .enabled(true)
                    .build();

            projectKeywords.add(projectKeyword);
        }

        // "신발 세일 이벤트" 프로젝트
        Project shoeSaleProject = projectRepository.findByBrandIdProject(nikeBrand.getId()).stream()
                .filter(p -> "신발 세일 이벤트".equals(p.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("신발 세일 이벤트 프로젝트가 생성되지 않았습니다."));

        String[] shoeSaleKeywords = {"에어 맥스", "에어 조던", "런닝화"};
        for (String keyword : shoeSaleKeywords) {
            // 기존 키워드 확인
            if (projectKeywordRepository.findByProjectIdAndKeyword(shoeSaleProject.getId(), keyword).isPresent()) {
                log.debug("기존 키워드 건너뜀: {} - {}", shoeSaleProject.getName(), keyword);
                continue;
            }

            ProjectKeyword projectKeyword = ProjectKeyword.builder()
                    .brand(nikeBrand)
                    .project(shoeSaleProject)
                    .keyword(keyword)
                    .enabled(true)
                    .build();

            projectKeywords.add(projectKeyword);
        }

        if (!projectKeywords.isEmpty()) {
            projectKeywordRepository.saveAll(projectKeywords);
            log.info("ProjectKeyword 신규 생성: {}개", projectKeywords.size());
        }

        long totalKeywordCount = projectKeywordRepository.findByProjectId(newYearProject.getId()).size() +
                projectKeywordRepository.findByProjectId(friendsProject.getId()).size() +
                projectKeywordRepository.findByProjectId(studentDiscountProject.getId()).size() +
                projectKeywordRepository.findByProjectId(shoeSaleProject.getId()).size();

        log.info("ProjectKeyword 생성 완료: 총 {}개", totalKeywordCount);
    }

    /**
     * 6단계: Board/Comment 생성
     * 브랜드별로 100개 이상 게시글 생성
     * 일부 게시글에 댓글/대댓글 생성
     * 실제 회사원들이 작성하는 것처럼 자연스러운 내용
     * 파일 첨부는 테스트 코드에서 제외 (MultipartFile 생성 및 파일 시스템 저장 필요)
     */
    private void createBoardsAndComments(List<Brand> brands, List<Member> members) {
        log.info("--- 6단계: Board/Comment 생성 시작 ---");

        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        // 스타벅스 브랜드 멤버 필터링
        List<Member> starbucksMembers = members.stream()
                .filter(m -> m.getEmail().startsWith("starbucks"))
                .toList();

        // 나이키 브랜드 멤버 필터링
        List<Member> nikeMembers = members.stream()
                .filter(m -> m.getEmail().startsWith("nike"))
                .toList();

        // 스타벅스 브랜드 게시글 생성
        createBoardsForBrand(starbucksBrand, starbucksMembers, "스타벅스");
        
        // 나이키 브랜드 게시글 생성
        createBoardsForBrand(nikeBrand, nikeMembers, "나이키");
    }

    private void createBoardsForBrand(Brand brand, List<Member> brandMembers, String brandName) {
        int targetBoardCount = 100;
        
        // 기존 게시글 확인
        long existingBoardCount = boardRepository.findByBrandIdAndDeletedAtIsNull(
                brand.getId(), 
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
        ).getTotalElements();
        
        if (existingBoardCount >= targetBoardCount) {
            log.info("{} 브랜드 Board 이미 {}개 이상 존재하여 건너뜀", brandName, existingBoardCount);
            return;
        }
        
        int boardsToCreate = (int) (targetBoardCount - existingBoardCount);
        log.info("{} 브랜드 Board 생성 필요: {}개 (기존: {}개)", brandName, boardsToCreate, existingBoardCount);
        
        List<Board> boards = new ArrayList<>();
        
        // 자연스러운 게시글 주제들
        String[] boardTopics = {
            "프로젝트 진행 상황 공유",
            "다음 주 회의 일정 안내",
            "신제품 출시 관련 논의",
            "마케팅 전략 회의록",
            "고객 피드백 정리",
            "월간 성과 리포트",
            "팀 빌딩 이벤트 제안",
            "업무 프로세스 개선안",
            "시장 동향 분석 자료",
            "경쟁사 분석 결과",
            "고객 만족도 조사 결과",
            "SNS 마케팅 성과 분석",
            "신규 캠페인 기획안",
            "예산 배정 관련 공지",
            "교육 프로그램 안내",
            "신규 입사자 환영",
            "프로젝트 마감 일정",
            "협업 도구 사용법",
            "보고서 작성 가이드",
            "고객 문의 FAQ 정리"
        };

        String[] boardContents = {
            "안녕하세요. 이번 주 프로젝트 진행 상황을 공유드립니다.\n\n현재까지 진행률은 약 70% 정도이며, 예상대로 다음 주 중순까지 완료 예정입니다.\n\n특히 주목할 점은 고객 반응이 매우 긍정적이라는 것입니다. 추가로 개선할 부분이 있으면 의견 부탁드립니다.",
            "다음 주 회의 일정을 안내드립니다.\n\n일시: 다음 주 월요일 오후 2시\n장소: 회의실 A\n\n주제: 신제품 출시 전략 논의\n\n참석 필수 인원은 모두 참석 부탁드립니다.",
            "신제품 출시와 관련하여 여러 의견을 나누고 싶습니다.\n\n현재 시장 상황을 고려할 때, 출시 시기를 조금 앞당기는 것이 좋을 것 같습니다.\n\n팀원 여러분의 의견을 듣고 싶습니다.",
            "오늘 마케팅 전략 회의에서 논의된 내용을 정리했습니다.\n\n주요 포인트:\n1. 타겟 고객층 재정의\n2. SNS 마케팅 강화\n3. 인플루언서 협업 확대\n\n자세한 내용은 첨부 파일을 참고해주세요.",
            "고객 피드백을 정리했습니다.\n\n긍정적인 피드백:\n- 제품 품질에 대한 만족도가 높음\n- 고객 서비스가 친절함\n\n개선이 필요한 부분:\n- 배송 시간 단축\n- 포장 개선\n\n이 부분들을 개선하기 위한 방안을 논의하고 싶습니다.",
            "이번 달 성과를 정리했습니다.\n\n매출: 전월 대비 15% 증가\n고객 수: 전월 대비 20% 증가\n\n목표 달성률: 110%\n\n모두 수고하셨습니다!",
            "팀 빌딩 이벤트를 제안합니다.\n\n일시: 다음 달 첫째 주 금요일\n장소: 회사 근처 레스토랑\n\n팀원들의 의견을 듣고 싶습니다. 참석 가능하신 분은 댓글로 알려주세요!",
            "업무 프로세스를 개선할 수 있는 방안을 제안합니다.\n\n현재 프로세스의 문제점:\n1. 보고서 작성 시간이 너무 오래 걸림\n2. 승인 절차가 복잡함\n\n개선안을 제시했으니 검토 부탁드립니다.",
            "최근 시장 동향을 분석한 자료입니다.\n\n주요 내용:\n- 경쟁사 동향\n- 시장 성장률\n- 고객 트렌드 변화\n\n이 자료를 바탕으로 전략을 수립하고 싶습니다.",
            "경쟁사 분석 결과를 공유합니다.\n\n주요 경쟁사들의 최근 움직임:\n1. A사: 신제품 출시 예정\n2. B사: 가격 인하 정책\n3. C사: 마케팅 강화\n\n우리도 대응 전략이 필요합니다."
        };

        // 게시글 생성
        for (int i = 0; i < boardsToCreate; i++) {
            Member writer = brandMembers.get(i % brandMembers.size());
            String topic = boardTopics[i % boardTopics.length];
            String content = boardContents[i % boardContents.length];
            
            // 제목에 번호와 날짜 느낌 추가
            String title = String.format("[%s] %s", brandName, topic);
            if (i > 0 && i % 20 == 0) {
                title = String.format("[%s] %s (업데이트)", brandName, topic);
            }

            Board board = Board.builder()
                    .brand(brand)
                    .writer(writer)
                    .title(title)
                    .content(content)
                    .build();

            boards.add(board);
        }

        if (!boards.isEmpty()) {
            boardRepository.saveAll(boards);
            log.info("{} 브랜드 Board 신규 생성: {}개", brandName, boards.size());
        }
        
        // 저장된 게시글 조회 (기존 + 신규)
        List<Board> allBoards = boardRepository.findByBrandIdAndDeletedAtIsNull(
                brand.getId(),
                org.springframework.data.domain.PageRequest.of(0, targetBoardCount)
        ).getContent();
        
        log.info("{} 브랜드 Board 총 {}개", brandName, allBoards.size());

        // 모든 게시글에 댓글/대댓글 생성
        List<Comment> comments = new ArrayList<>();

        String[] commentContents = {
            "좋은 정보 감사합니다!",
            "공감합니다. 저도 같은 생각이에요.",
            "추가로 논의가 필요한 부분이 있을 것 같습니다.",
            "잘 정리해주셨네요. 참고하겠습니다.",
            "이 부분은 좀 더 검토가 필요할 것 같습니다.",
            "좋은 제안입니다. 실행해볼 만하네요.",
            "수고하셨습니다!",
            "의견 주셔서 감사합니다.",
            "다음 회의에서 더 자세히 논의하면 좋을 것 같습니다.",
            "실행 가능한 방안인지 검토해보겠습니다.",
            "저도 비슷한 경험이 있어서 공감이 가네요.",
            "좋은 지적입니다. 반영하겠습니다.",
            "추가 자료가 있으면 공유 부탁드립니다.",
            "팀원들과 상의 후 답변드리겠습니다.",
            "빠른 대응 감사합니다!"
        };

        String[] replyContents = {
            "네, 맞습니다!",
            "좋은 의견 감사합니다.",
            "추가로 설명드리면...",
            "그 부분은 제가 확인해보겠습니다.",
            "동의합니다.",
            "좋은 지적이네요.",
            "감사합니다!",
            "알겠습니다.",
            "확인해보고 답변드리겠습니다.",
            "네, 그렇게 진행하겠습니다."
        };

        // 모든 게시글에 댓글 생성 (기존 게시글 포함)
        for (int i = 0; i < allBoards.size(); i++) {
            Board board = allBoards.get(i);
            
            // 기존 댓글 확인
            long existingCommentCount = commentRepository.countByBoardIdAndDeletedAtIsNull(board.getId());
            if (existingCommentCount > 0) {
                log.debug("기존 댓글 건너뜀: Board id={}, 댓글 {}개", board.getId(), existingCommentCount);
                continue;
            }
            
            List<Member> availableMembers = new ArrayList<>(brandMembers);
            
            // 댓글 개수 결정 (1~5개)
            int commentCount = (i % 5) + 1;
            
            for (int j = 0; j < commentCount; j++) {
                Member commentWriter = availableMembers.get((i + j) % availableMembers.size());
                String commentContent = commentContents[(i + j) % commentContents.length];
                
                Comment parentComment = Comment.builder()
                        .board(board)
                        .writer(commentWriter)
                        .parent(null)
                        .content(commentContent)
                        .build();
                
                comments.add(parentComment);
                
                // 일부 댓글에 대댓글 추가 (약 50%)
                if (j % 2 == 0 && j < commentCount - 1) {
                    Member replyWriter = availableMembers.get((i + j + 1) % availableMembers.size());
                    String replyContent = replyContents[(i + j) % replyContents.length];
                    
                    Comment reply = Comment.builder()
                            .board(board)
                            .writer(replyWriter)
                            .parent(parentComment)
                            .content(replyContent)
                            .build();
                    
                    comments.add(reply);
                }
            }
        }

        if (!comments.isEmpty()) {
            commentRepository.saveAll(comments);
            log.info("{} 브랜드 Comment 신규 생성: {}개", brandName, comments.size());
        }
        
        // 전체 댓글 수 계산
        long totalCommentCount = allBoards.stream()
                .mapToLong(board -> commentRepository.countByBoardIdAndDeletedAtIsNull(board.getId()))
                .sum();
        
        log.info("{} 브랜드 Comment 총 {}개", brandName, totalCommentCount);
    }

    /**
     * 7단계: Strategy 생성
     * 프로젝트별로 15개씩 그럴듯한 마케팅 전략 생성
     */
    private List<Strategy> createStrategies() {
        log.info("--- 7단계: Strategy 생성 시작 ---");

        String[] strategyTitles = {
            "SNS 브랜드 인게이지먼트 전략",
            "타깃 오디언스 확장 전략",
            "콘텐츠 리치 최적화 전략",
            "전환율 기반 퍼포먼스 전략",
            "인플루언서 마케팅 전략",
            "바이럴 마케팅 전략",
            "고객 리텐션 강화 전략",
            "브랜드 인지도 향상 전략",
            "제품 런칭 프로모션 전략",
            "세그먼트별 맞춤 마케팅 전략",
            "크로스 채널 마케팅 전략",
            "데이터 기반 의사결정 전략",
            "고객 여정 최적화 전략",
            "소셜 미디어 광고 최적화 전략",
            "이벤트 기반 마케팅 전략"
        };

        List<Strategy> strategies = new ArrayList<>();

        for (String title : strategyTitles) {
            // 기존 전략 확인
            Strategy existingStrategy = strategyRepository.findByTitle(title).orElse(null);
            if (existingStrategy != null) {
                strategies.add(existingStrategy);
                log.debug("기존 전략 사용: {}", title);
                continue;
            }

            Strategy strategy = Strategy.builder()
                    .title(title)
                    .build();

            strategies.add(strategy);
        }

        // 신규 전략만 저장
        List<Strategy> newStrategies = strategies.stream()
                .filter(s -> s.getId() == null)
                .toList();

        if (!newStrategies.isEmpty()) {
            strategyRepository.saveAll(newStrategies);
            log.info("Strategy 신규 생성: {}개", newStrategies.size());
        }

        log.info("Strategy 생성 완료: 총 {}개", strategies.size());
        return strategies;
    }

    /**
     * 8단계: Solution 생성
     * 프로젝트별로 전략 15개씩 조합하여 가격·설명 다양화
     */
    private List<Solution> createSolutions(List<Brand> brands, List<Strategy> strategies) {
        log.info("--- 8단계: Solution 생성 시작 ---");

        Brand starbucksBrand = brands.stream()
                .filter(b -> "스타벅스".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("스타벅스 브랜드가 생성되지 않았습니다."));

        Brand nikeBrand = brands.stream()
                .filter(b -> "나이키".equals(b.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("나이키 브랜드가 생성되지 않았습니다."));

        // 프로젝트 조회
        List<Project> starbucksProjects = projectRepository.findByBrandIdProject(starbucksBrand.getId());
        List<Project> nikeProjects = projectRepository.findByBrandIdProject(nikeBrand.getId());

        List<Solution> solutions = new ArrayList<>();

        // 각 프로젝트별로 모든 전략에 대해 솔루션 생성
        for (Project project : starbucksProjects) {
            for (Strategy strategy : strategies) {
                // 기존 솔루션 확인
                List<Solution> existingSolutions = solutionRepository.findSolutionsByProjectAndStrategy(
                        project.getId(), strategy.getId());
                boolean exists = existingSolutions.stream()
                        .anyMatch(s -> !s.isDeleted() && !s.isPurchased());

                if (exists) {
                    log.debug("기존 솔루션 건너뜀: 프로젝트 {} - 전략 {}", project.getName(), strategy.getTitle());
                    continue;
                }

                // 가격 다양화 (10,000원 ~ 100,000원)
                int basePrice = 10000;
                int priceMultiplier = (strategies.indexOf(strategy) % 10) + 1;
                int price = basePrice * priceMultiplier;

                // 설명 다양화
                String description = String.format(
                    "%s를 기반으로 한 %s 프로젝트 솔루션입니다. " +
                    "이 솔루션은 고객 참여도를 높이고 브랜드 가치를 향상시키는 것을 목표로 합니다. " +
                    "데이터 기반 인사이트를 제공하여 마케팅 성과를 극대화할 수 있습니다.",
                    strategy.getTitle(), project.getName()
                );

                Solution solution = Solution.builder()
                        .strategy(strategy)
                        .project(project)
                        .title(String.format("%s - %s", project.getName(), strategy.getTitle()))
                        .price(price)
                        .description(description)
                        .deleted(false)
                        .isPurchased(false)
                        .build();

                solutions.add(solution);
            }
        }

        for (Project project : nikeProjects) {
            for (Strategy strategy : strategies) {
                // 기존 솔루션 확인
                List<Solution> existingSolutions = solutionRepository.findSolutionsByProjectAndStrategy(
                        project.getId(), strategy.getId());
                boolean exists = existingSolutions.stream()
                        .anyMatch(s -> !s.isDeleted() && !s.isPurchased());

                if (exists) {
                    log.debug("기존 솔루션 건너뜀: 프로젝트 {} - 전략 {}", project.getName(), strategy.getTitle());
                    continue;
                }

                // 가격 다양화 (10,000원 ~ 100,000원)
                int basePrice = 10000;
                int priceMultiplier = (strategies.indexOf(strategy) % 10) + 1;
                int price = basePrice * priceMultiplier;

                // 설명 다양화
                String description = String.format(
                    "%s를 기반으로 한 %s 프로젝트 솔루션입니다. " +
                    "이 솔루션은 고객 참여도를 높이고 브랜드 가치를 향상시키는 것을 목표로 합니다. " +
                    "데이터 기반 인사이트를 제공하여 마케팅 성과를 극대화할 수 있습니다.",
                    strategy.getTitle(), project.getName()
                );

                Solution solution = Solution.builder()
                        .strategy(strategy)
                        .project(project)
                        .title(String.format("%s - %s", project.getName(), strategy.getTitle()))
                        .price(price)
                        .description(description)
                        .deleted(false)
                        .isPurchased(false)
                        .build();

                solutions.add(solution);
            }
        }

        if (!solutions.isEmpty()) {
            solutionRepository.saveAll(solutions);
            log.info("Solution 신규 생성: {}개", solutions.size());
        }

        // 기존 솔루션도 포함하여 반환
        List<Solution> allSolutions = new ArrayList<>();
        
        // 스타벅스 프로젝트 솔루션
        for (Project project : starbucksProjects) {
            for (Strategy strategy : strategies) {
                List<Solution> existingSolutions = solutionRepository.findSolutionsByProjectAndStrategy(
                        project.getId(), strategy.getId());
                allSolutions.addAll(existingSolutions.stream()
                        .filter(s -> !s.isDeleted())
                        .toList());
            }
        }
        
        // 나이키 프로젝트 솔루션
        for (Project project : nikeProjects) {
            for (Strategy strategy : strategies) {
                List<Solution> existingSolutions = solutionRepository.findSolutionsByProjectAndStrategy(
                        project.getId(), strategy.getId());
                allSolutions.addAll(existingSolutions.stream()
                        .filter(s -> !s.isDeleted())
                        .toList());
            }
        }

        long totalSolutionCount = allSolutions.size();
        log.info("Solution 생성 완료: 총 {}개 (신규: {}개)", totalSolutionCount, solutions.size());
        return allSolutions;
    }

    /**
     * 9단계: Orders/Payment 생성
     * 여러 멤버가 다양한 솔루션을 구매한 주문 내역 구성
     */
    private void createOrders(List<Member> members, List<Solution> solutions) {
        log.info("--- 9단계: Orders/Payment 생성 시작 ---");

        if (solutions.isEmpty()) {
            log.warn("생성된 솔루션이 없어 주문을 생성할 수 없습니다.");
            return;
        }

        // 기존 주문 확인
        long existingOrderCount = paymentRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .count();
        
        int targetOrderCount = 30;
        if (existingOrderCount >= targetOrderCount) {
            log.info("Orders 이미 {}개 이상 존재하여 건너뜀", existingOrderCount);
            return;
        }
        
        int ordersToCreate = (int) (targetOrderCount - existingOrderCount);
        log.info("Orders 생성 필요: {}개 (기존: {}개)", ordersToCreate, existingOrderCount);

        List<Orders> orders = new ArrayList<>();

        // 구매 가능한 멤버 필터링 (승인된 멤버만)
        List<Member> purchasableMembers = members.stream()
                .filter(Member::isApproved)
                .toList();

        if (purchasableMembers.isEmpty()) {
            log.warn("구매 가능한 멤버가 없어 주문을 생성할 수 없습니다.");
            return;
        }

        // 구매 가능한 솔루션 필터링 (구매되지 않은 솔루션만)
        List<Solution> purchasableSolutions = solutions.stream()
                .filter(s -> !s.isPurchased() && !s.isDeleted())
                .toList();
        
        if (purchasableSolutions.isEmpty()) {
            log.warn("구매 가능한 솔루션이 없어 주문을 생성할 수 없습니다.");
            return;
        }

        for (int i = 0; i < ordersToCreate; i++) {
            // 랜덤 멤버 선택
            Member buyer = purchasableMembers.get(i % purchasableMembers.size());
            
            // 랜덤 솔루션 선택 (1~3개, 구매 가능한 솔루션만)
            int solutionCount = (i % 3) + 1;
            List<Solution> selectedSolutions = new ArrayList<>();
            for (int j = 0; j < solutionCount && j < purchasableSolutions.size(); j++) {
                Solution solution = purchasableSolutions.get((i + j) % purchasableSolutions.size());
                // 이미 구매된 솔루션인지 다시 확인
                if (!solution.isPurchased() && !solution.isDeleted()) {
                    selectedSolutions.add(solution);
                }
            }
            
            if (selectedSolutions.isEmpty()) {
                log.debug("구매 가능한 솔루션이 없어 주문 건너뜀");
                continue;
            }

            // 프로젝트 ID (첫 번째 솔루션의 프로젝트 사용)
            Long projectId = selectedSolutions.get(0).getProject().getId();

            // 총 금액 계산
            int totalPrice = selectedSolutions.stream()
                    .mapToInt(Solution::getPrice)
                    .sum();

            // 주문 생성
            Orders order = Orders.builder()
                    .paymentId("ORDER_" + System.currentTimeMillis() + "_" + i)
                    .buyMemberId(buyer.getId())
                    .projectId(projectId)
                    .totalPrice(totalPrice)
                    .receiptUrl("https://receipt.example.com/" + i)
                    .status(OrderStatus.PAID)
                    .build();

            // 주문 아이템 생성
            for (Solution solution : selectedSolutions) {
                OrderItem orderItem = OrderItem.builder()
                        .solution(solution)
                        .solutionName(solution.getTitle())
                        .orderPrice(solution.getPrice())
                        .quantity(1)
                        .build();

                order.addOrderItem(orderItem);
            }

            orders.add(order);
        }

        if (!orders.isEmpty()) {
            paymentRepository.saveAll(orders);
            log.info("Orders 신규 생성: {}개", orders.size());
            
            // 솔루션 구매 상태 업데이트
            List<Solution> solutionsToUpdate = new ArrayList<>();
            for (Orders order : orders) {
                for (OrderItem item : order.getOrderItems()) {
                    Solution solution = item.getSolution();
                    if (!solution.isPurchased()) {
                        solution.markAsPurchased();
                        solutionsToUpdate.add(solution);
                    }
                }
            }
            
            if (!solutionsToUpdate.isEmpty()) {
                solutionRepository.saveAll(solutionsToUpdate);
            }
        }
        
        long totalOrderCount = paymentRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID)
                .count();
        
        log.info("Orders 생성 완료: 총 {}개", totalOrderCount);
    }
}