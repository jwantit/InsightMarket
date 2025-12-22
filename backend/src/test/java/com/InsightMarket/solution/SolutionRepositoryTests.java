//package com.InsightMarket.solution;
//
//import com.InsightMarket.domain.project.Project;
//import com.InsightMarket.domain.solution.Solution;
//import com.InsightMarket.domain.strategy.Strategy;
//import com.InsightMarket.repository.project.ProjectRepository;
//import com.InsightMarket.repository.solution.SolutionRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.annotation.Commit;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//
//@SpringBootTest
//public class SolutionRepositoryTests {
//
//
//    @Autowired
//    private SolutionRepository solutionRepository;
//
//    @Autowired
//    private ProjectRepository projectRepository;
//
//    @Test
//    @Transactional
//    @Commit
//    public void testInsertProject () {
//
//        Project project = Project.builder()
//                .name("갤럭시 행사")
//                .startDate(LocalDate.now())
//                .endDate(LocalDate.now().plusDays(30))
//                .build();
//
//        Project project1 = Project.builder()
//                .name("비스포크 할인행사")
//                .startDate(LocalDate.now())
//                .endDate(LocalDate.now().plusDays(30))
//                .build();
//
//        projectRepository.save(project);
//        projectRepository.save(project1);
//
//    }
//
//
//
//
//
//
//
//    @Test
//    @Transactional
//    @Commit
//    public void testInsertSolution () {
//
//        for (int x = 1; x <= 5; x++) {
//            Strategy strategy = Strategy.builder()
//                    .title("전략" + x).build();
//
//            for (int i = 1; i <= 3; i++) {
//                Solution solution = Solution.builder()
//                        .strategy(strategy);
//
//            }
//        }
//
//
//
//
//    }
//
//}