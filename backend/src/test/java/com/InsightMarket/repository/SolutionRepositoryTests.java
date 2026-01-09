package com.InsightMarket.repository;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.domain.strategy.Strategy;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import com.InsightMarket.repository.strategy.StrategyRepository;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Log4j2
@ToString
public class SolutionRepositoryTests {


    @Autowired
    private SolutionRepository solutionRepository;

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private StrategyRepository strategyRepository;

    @Autowired
    private BrandRepository brandRepository;


    @Test
    @Transactional
    @Commit
    public void testInsertProject () {

        Optional<Brand> brand1 = brandRepository.findById(1L);
        Brand brand = brand1.orElseThrow();

        Project project = Project.builder()
                .name("갤럭시 행사")
                .brand(brand)
                .build();

        Project project1 = Project.builder()
                .name("비스포크 할인행사")
                .brand(brand)
                .build();

        projectRepository.save(project);
        projectRepository.save(project1);
    }


    @Test
    @Transactional
    @Commit
    public void SolutionTests() {

        // 🔹 이미 존재하는 프로젝트 2개 불러오기
        Project project1 = projectRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("project1 없음"));

        Project project2 = projectRepository.findById(2L)
                .orElseThrow(() -> new RuntimeException("project2 없음"));
//---------------------------------------------------------------------------------------------------------
        // 🔹 전략 4개 생성
        Strategy strategyA = strategyRepository.save(
                Strategy.builder()
                        .title("SNS 브랜드 인게이지먼트 전략")
                        .build()
        );

        Strategy strategyB = strategyRepository.save(
                Strategy.builder()
                        .title("타깃 오디언스 확장 전략")
                        .build()
        );

        Strategy strategyC = strategyRepository.save(
                Strategy.builder()
                        .title("콘텐츠 리치 최적화 전략")
                        .build()
        );

        Strategy strategyD = strategyRepository.save(
                Strategy.builder()
                        .title("전환율 기반 퍼포먼스 전략")
                        .build()
        );
//-------------------------------------------------------------------------------------------------
        // 🔹 솔루션 6개 생성 (각 전략당 3개)
        // 🔹 strategyA → project1
        for (int i = 1; i <= 4; i++) {
            solutionRepository.save(
                    Solution.builder()
                            .strategy(strategyA)
                            .project(project1)
                            .title("A전략 솔루션 " + i)
                            .price(1000 * i)
                            .description("A전략 기반 솔루션 " + i)
                            .deleted(false)
                            .build()
            );
        }

// 🔹 strategyB → project1
        for (int i = 1; i <= 4; i++) {
            solutionRepository.save(
                    Solution.builder()
                            .strategy(strategyB)
                            .project(project1)
                            .title("B전략 솔루션 " + i)
                            .price(2000 * i)
                            .description("B전략 기반 솔루션 " + i)
                            .build()
            );
        }

// 🔹 strategyC → project2
        for (int i = 1; i <= 4; i++) {
            solutionRepository.save(
                    Solution.builder()
                            .strategy(strategyC)
                            .project(project2)
                            .title("C전략 솔루션 " + i)
                            .price(3000 * i)
                            .description("C전략 기반 솔루션 " + i)
                            .build()
            );
        }

// 🔹 strategyD → project2
        for (int i = 1; i <= 4; i++) {
            solutionRepository.save(
                    Solution.builder()
                            .strategy(strategyD)
                            .project(project2)
                            .title("D전략 솔루션 " + i)
                            .price(4000 * i)
                            .description("D전략 기반 솔루션 " + i)
                            .build()
            );
        }
        System.out.println("=== 테스트 완료 ===");
    }

    @Test
    @Transactional
    @Commit
    public void SolutionGetTests() {
        List<Solution> getList = solutionRepository.findAll();
        getList.forEach(solution -> log.info("solution={}", solution));    }


    @Test
    @Transactional
    @Commit
    public void BrandSetTests() {

        List<Brand> getList = brandRepository.findAll();

        getList.forEach(brand ->
                log.info("brand={}", brand)
        );
    }

    @Test
    @Transactional
    @Commit
    public void ProjectGetTests() {

        Long brandId = 1L;

        List<Project> projectList = projectRepository.findByBrandIdProject(brandId);

        projectList.forEach(project ->
                log.info("project={}", project)
        );
    }

}