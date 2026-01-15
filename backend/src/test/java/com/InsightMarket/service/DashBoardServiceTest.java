package com.InsightMarket.service;

import com.InsightMarket.dto.dashboard.*;
import com.InsightMarket.service.dashboard.DashBoardService;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Log4j2
@ToString
public class DashBoardServiceTest {

    @Autowired
    private DashBoardService dashBoardService;

    @Test
    @Transactional
    @Commit
    public void testDashBoardServiceDailyStats() {

            // 1. Given: 테스트에 필요한 파라미터 설정
            Long brandId = 1L; // TODO: 실제 DB에 존재하는 브랜드 ID로 변경하세요
            List<String> channels = List.of("NAVER", "YOUTUBE"); // TODO: 실제 DB에 있는 채널명으로 변경

            DashBoardRequestDTO requestDTO = DashBoardRequestDTO.builder().brandId(brandId)
                    .contentChannel(channels).build();

            // 2. When: 서비스 메서드 호출
            log.info("------------------------------------------");
            log.info("대시보드 분석 시작 - 브랜드 ID: {}, 채널: {}", brandId, channels);

        BrandMentionSummaryResponseDTO result = dashBoardService.getBrandDailyAnalysis(requestDTO);

            // 3. Then: 결과 확인 (콘솔 출력)
            log.info("------------------------------------------");
            log.info("1. 조회 기간: {}", result.getDateRange());
            log.info("2. 주간 성장률: {}", result.getWeeklyGrowthRate());
            log.info("3. 인사이트 메시지: {}", result.getInsightMessage());
            log.info("4. 피크 날짜: {}", result.getPeakDate());
            log.info("5. 가장 인기 있는 채널: {}", result.getPopularChannel());
            log.info("------------------------------------------");

            // 단언문(Assertion) 추가 - 결과가 null이 아닌지 확인
            assert result != null;
            assert result.getWeeklyGrowthRate() != null;
        }

    @Test
    @Transactional
    public void checkDailyChartData() {
        // 1. Given (데이터 준비)
        Long targetBrandId = 1L; // 실제 DB에 있는 브랜드 ID로 수정하세요
        List<String> channels = List.of("NAVER", "YOUTUBE");

        DashBoardRequestDTO requestDTO = new DashBoardRequestDTO();
        requestDTO.setBrandId(targetBrandId);
        requestDTO.setContentChannel(channels);
        requestDTO.setUnit("day");

        // 2. When (서비스 실행)
        BrandAllChartResponseDTO response = dashBoardService.getBrandMentionChart(requestDTO);

        // 3. Then (결과 출력해서 눈으로 확인)
        System.out.println("========= 테스트 결과 시작 =========");
        System.out.println("조회 단위: " + response.getUnit());

        if (response.getChartData() != null) {
            for (BrandMentionChartDataDTO data : response.getChartData()) {
                System.out.println(String.format("[%s] 전체합계: %d | 네이버: %d | 유튜브: %d",
                        data.getDate(),
                        data.getCount(),
                        data.getNaver(),
                        data.getYoutube()));
            }
        }
        System.out.println("========= 테스트 결과 종료 =========");
    }


    @Test
    @Transactional
    public void getBrandSentimentAnalysis_통합_테스트() {
        // 1. Given: 테스트 데이터 설정
        Long testBrandId = 1L;
        List<String> channels = List.of("NAVER", "YOUTUBE");
        DashBoardRequestDTO requestDTO = new DashBoardRequestDTO();
        requestDTO.setBrandId(testBrandId);
        requestDTO.setContentChannel(channels);

        // 2. When: 실제 서비스 로직 호출
        BrandSentimentResponseDTO response = dashBoardService.getBrandSentimentAnalysis(requestDTO);


        if (!response.getAveragePositiveRatio().equals("0.0%")) {
            // 합계 100% 검증 (도넛 차트 핵심 로직)
            double totalSum = response.getPosValue() + response.getNegValue() + response.getNeuValue();

            // 콘솔 출력
            System.out.println("======= [Sentiment Analysis Test] =======");
            System.out.println("분석 기간  : " + response.getDateRange());
            System.out.println("주요 채널  : " + response.getTopSource());
            System.out.println("----------------------------------------");
            System.out.println("긍정 수치  : " + response.getAveragePositiveRatio() + " (" + response.getPosValue() + ")");
            System.out.println("부정 수치  : " + response.getNegValue());
            System.out.println("중립 수치  : " + response.getNeuValue());
            System.out.println("합계(100%) : " + totalSum);
            System.out.println("----------------------------------------");
            System.out.println("Best Date : " + response.getMostPositiveDate());
            System.out.println("Worst Date: " + response.getMostNegativeDate());
            System.out.println("=========================================");

            // 기술적 검증
        } else {
            System.out.println("조회된 데이터가 없어 기본값이 반환되었습니다.");
        }
    }

    @Test
    @Transactional
    public void getWordcloud() {
        // 1. Given: 이미 DB에 데이터가 있으므로 요청 DTO만 준비
        // (이미지의 brand_id가 2였으므로 2L로 설정)
        Long testBrandId = 1L;
        List<String> channels = List.of("YOUTUBE");

        DashBoardRequestDTO requestDTO = new DashBoardRequestDTO();
        requestDTO.setBrandId(testBrandId);
        requestDTO.setContentChannel(channels);

        // 2. When: 서비스 메서드 호출
        BrandWordCloudResponseDTO response = dashBoardService.getBrandWordCloudData(requestDTO);


        // 데이터가 하나라도 넘어오는지 확인
        if (!response.getWordCloudRow().isEmpty()) {
            System.out.println("조회된 단어 개수: " + response.getWordCloudRow().size());

            // 첫 번째 데이터 출력해보기 (정상적으로 매핑되었는지)
            BrandWordCloudDTO firstWord = response.getWordCloudRow().get(1);
            System.out.println("가장 빈도 높은 단어: " + firstWord.getText());
            System.out.println("합산 수치(value): " + firstWord.getValue());
            System.out.println("감성(polarity): " + firstWord.getPolarity());

        } else {
            // 데이터가 비어있다면, DB의 stat_date가 최근 7일 밖이거나 brand_id 불일치일 가능성 큼
            System.out.println("⚠️ 조회의 범위에 해당하는 데이터가 DB에 없습니다.");
        }
    }

    @Test
    @DisplayName("감성 차트 데이터 매핑 확인")
    @Transactional
    public void checkSentimentData() {
        // 1. Given
        DashBoardRequestDTO requestDTO = new DashBoardRequestDTO();
        requestDTO.setBrandId(1L);
        requestDTO.setContentChannel(List.of("YOUTUBE", "NAVER"));
        requestDTO.setUnit("day");

        // 2. When
        BrandAllChartResponseDTO result = dashBoardService.getBrandSentimentChart(requestDTO);

        // 3. Then (단순 출력)
        System.out.println("\n>>> [감성 차트 데이터 결과]");
        System.out.println("조회 단위: " + result.getUnit());
        System.out.println("날짜       | 총합 | 긍정 | 중립 | 부정");
        System.out.println("------------------------------------");

        // 결과 객체에서 리스트를 꺼내옴
        List<BrandSentimentChartDataDTO> dataList = result.getSentiment();

        if (dataList != null && !dataList.isEmpty()) {
            dataList.forEach(row ->
                    System.out.printf("%10s | %4d | %4d | %4d%n",
                            row.getDate(),
                            row.getPositive(),
                            row.getNeutral(),
                            row.getNegative())
            );
        } else {
            System.out.println("⚠️ 데이터가 존재하지 않습니다. 서비스 로직 및 DB를 확인하세요.");
        }


    }


    }

