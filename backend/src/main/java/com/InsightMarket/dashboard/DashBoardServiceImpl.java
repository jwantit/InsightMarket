package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.*;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordDailyStats;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordInsightResult;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordSentimentDailyStats;
import com.InsightMarket.domain.analytics.keyword.AnalyticsKeywordTokenSentimentStats;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordDailyStatsRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordInsightResultRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordSentimentDailyStatsRepository;
import com.InsightMarket.repository.analytics.keyword.AnalyticsKeywordTokenSentimentStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StopWatch;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Log4j2
@RequiredArgsConstructor
@Transactional(readOnly = true)
class DashBoardServiceImpl implements DashBoardService {
    //인사이트
    private final AnalyticsKeywordInsightResultRepository analyticsKeywordInsightResultRepository;
    //언급량
    private final AnalyticsKeywordDailyStatsRepository analyticsKeywordDailyStatsRepository;
    //긍부정
    private final AnalyticsKeywordSentimentDailyStatsRepository analyticsKeywordSentimentDailyStatsRepository;
    //워드클라우드
    private final AnalyticsKeywordTokenSentimentStatsRepository analyticsKeywordTokenSentimentStatsRepository;


    @Override
    public BrandMentionSummaryResponseDTO getBrandDailyAnalysis(DashBoardRequestDTO dashBoardRequestDTO) {
        //브랜드PK
        Long brandId = dashBoardRequestDTO.getBrandId();
        //[YOUTUBE,NAVER]
        List<String> contentChannel = dashBoardRequestDTO.getContentChannel();
        //데이터 범위 6일
        LocalDate startDate = LocalDate.now().minusDays(6);
        //오늘
        LocalDate endDate = LocalDate.now();

        //인사이트 텍스트 가져오기(함수)------------------------------
        String insightMessage = insightMessage(brandId);
        //-------------------------------------------------

        //가장 언급량 많은 소스----------
        String popularChannel = analyticsKeywordDailyStatsRepository
                .findMentionTopSourceForDashboard(brandId, startDate, endDate, contentChannel)
                .orElse("데이터 없음"); // 데이터가 없을 때의 기본값 설정
        //---------------------------
        //데이터 최고점 발생 날짜---------------------------
        String peakDateStr = analyticsKeywordDailyStatsRepository
                .findMentionTopDateDashboard(brandId, startDate, endDate, contentChannel)
                .map(LocalDate::toString)
                .orElse("데이터 없음");

        //이번주 총합을 계산하고 저번 주 총합을 계산하여 상승 하락
        Long thisWeekSum = analyticsKeywordDailyStatsRepository
                .sumTotalMentionCount(brandId,startDate,endDate,contentChannel);
        thisWeekSum = (thisWeekSum != null) ? thisWeekSum : 0L;

        //저저번주 -> 저번주
        LocalDate lastEndDate = startDate.minusDays(1);
        LocalDate lastStartDate = lastEndDate.minusDays(6);

        Long lastWeekSum = analyticsKeywordDailyStatsRepository
                .sumTotalMentionCount(brandId, lastStartDate, lastEndDate, contentChannel);
        lastWeekSum = (lastWeekSum != null) ? lastWeekSum : 0L;

        double rate = 0.0;
        if (lastWeekSum > 0) {
            rate = ((double)(thisWeekSum - lastWeekSum) / lastWeekSum) * 100;
        } else if (lastWeekSum == 0 && thisWeekSum > 0) {
            rate = 100.0; // 지난주 데이터가 0인데 이번주에 생겼다면 100% 상승으로 표시
        }
        String weeklyGrowthRate = String.format("%+.1f%%", rate);

        //총 범위 날짜 텍스트---------------------------------------
        //2025-10-01 ~ 2025-10-07
        String dateRange = startDate.toString() + " ~ " + endDate.toString();
        //------------------------------------------------------

        return  BrandMentionSummaryResponseDTO.builder()
                .weeklyGrowthRate(weeklyGrowthRate) //전년도 대비
                .insightMessage(insightMessage) //요약 증가했습니다.
                .peakDate(peakDateStr) //언급량 많았던 날짜 7일
                .popularChannel(popularChannel) //인기채널 7일
                .dateRange(dateRange) //조회범위 문자열
                .build();
    }

    //인사이트 함수-----------------------------------------------------------------------------------
    public String insightMessage(Long brandId) {
        return analyticsKeywordInsightResultRepository.findBrandInsights(brandId)
                .map(AnalyticsKeywordInsightResult::getInsightText) // 데이터 있으면 텍스트 추출
                .orElse("아직 집계 전"); // 없으면 기본값 반환
    }
    //-----------------------------------------------------------------------------------


    @Override
    public BrandAllChartResponseDTO getBrandMentionChart(DashBoardRequestDTO dashBoardRequestDTO) {
        //일별 주별 월별
        String unit = (dashBoardRequestDTO.getUnit() == null) ? "day" : dashBoardRequestDTO.getUnit();
        List<BrandMentionChartDataDTO> chartData;


        switch (unit) {
            case "week":
                chartData = fetchWeeklyData(dashBoardRequestDTO);
                break;
            case "day":
            default: // "day"이거나 그 외 예상치 못한 값이 들어오면 모두 일별 데이터로 처리
                chartData = fetchDailyData(dashBoardRequestDTO);
                unit = "day"; // default로 들어온 경우를 대비해 unit 이름도 day로 명시
                break;
        }


        return BrandAllChartResponseDTO.builder()
                .unit(unit)
                .chartData(chartData)
                .build();
    }
//브랜드 언급차트 함수 ------------------------------------------------------------------------------
    
    //일별
private List<BrandMentionChartDataDTO> fetchDailyData(DashBoardRequestDTO dto) {
        //오늘
    LocalDate endDate = LocalDate.now();
        //7일전
    LocalDate startDate = endDate.minusDays(6);

    List<AnalyticsKeywordDailyStats> dailyData = analyticsKeywordDailyStatsRepository
            .findStatsForDashboard(dto.getBrandId(), startDate, endDate, dto.getContentChannel());

    // 1. 날짜별로 네이버/유튜브/합계를 관리할 Map 생성
    Map<LocalDate, BrandMentionChartDataDTO> dailyTotalMap = new HashMap<>();

    for (AnalyticsKeywordDailyStats stats : dailyData) {
        //db에서 가져온 객체의 stet Date
        LocalDate date = stats.getStatDate();
        long count = stats.getMentionCount();
        String source = stats.getSource();

        // HashMap<> date로 탐색 해당 날짜의 DTO가 없으면 새로 생성 (기본값 0)
        //있으면 HashMap<>의 데이터를 data에게 ~~
        BrandMentionChartDataDTO data = dailyTotalMap.getOrDefault(date,
                new BrandMentionChartDataDTO(date.toString(), 0L, 0L, 0L));

        // 소스별로 값을 누적 (작성하신 합산 로직의 확장판)
        if ("NAVER".equals(source)) data.setNaver(count);
        if ("YOUTUBE".equals(source)) data.setYoutube(count);

        data.setCount(data.getCount() + count); // 선택된 채널들의 총 합계

        dailyTotalMap.put(date, data);
    }

    // 2. 7일치 날짜를 순회하며 빈 곳을 0으로 채워 최종 리스트 반환
    List<BrandMentionChartDataDTO> result = new ArrayList<>();
    for (int i = 0; i < 7; i++) {
        LocalDate date = startDate.plusDays(i);
        // 맵에 데이터가 없으면 0으로 채워진 새 객체를 넣음
        result.add(dailyTotalMap.getOrDefault(date,
                new BrandMentionChartDataDTO(date.toString(), 0L, 0L, 0L)));
    }

    return result;
}

    private List<BrandMentionChartDataDTO> fetchWeeklyData(DashBoardRequestDTO dto) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusWeeks(7); // 최근 8주

        List<AnalyticsKeywordDailyStats> dailyData = analyticsKeywordDailyStatsRepository
                .findStatsForDashboard(dto.getBrandId(), startDate, endDate, dto.getContentChannel());

        // 1. 주차별 합산 (Key: 그 주의 월요일 날짜 문자열)
        Map<String, BrandMentionChartDataDTO> weeklyTotalMap = new HashMap<>();

        for (AnalyticsKeywordDailyStats stats : dailyData) {
            // 해당 날짜가 속한 주의 월요일 구하기 (이게 상자의 이름표가 됩니다)
            //각각의 날짜가 주차 기준에 해당하면 주차의 첫 일로 맵에 키 날짜를 지정
            String weekKey = stats.getStatDate().with(java.time.DayOfWeek.MONDAY).toString();
            long count = stats.getMentionCount();

            BrandMentionChartDataDTO data = weeklyTotalMap.getOrDefault(weekKey,
                    new BrandMentionChartDataDTO(weekKey, 0L, 0L, 0L));

            // 채널별 합산 및 전체 합계 누적
            if ("NAVER".equals(stats.getSource())) data.setNaver(data.getNaver() + count);
            if ("YOUTUBE".equals(stats.getSource())) data.setYoutube(data.getYoutube() + count);

            data.setCount(data.getCount() + count);
            weeklyTotalMap.put(weekKey, data);
        }

        // 2. 최근 8주의 월요일을 순회하며 리스트 생성 (빈 주차 0 채우기)
        List<BrandMentionChartDataDTO> result = new ArrayList<>();
        for (int i = 0; i <= 7; i++) {
            String weekKey = startDate.plusWeeks(i).with(java.time.DayOfWeek.MONDAY).toString();

            result.add(weeklyTotalMap.getOrDefault(weekKey,
                    new BrandMentionChartDataDTO(weekKey, 0L, 0L, 0L)));
        }

        return result;
    }
    // ------------------------------------------------------------------------------










    //긍 부정
    //---------------------------------------------------------------------------------

    @Override
    public BrandSentimentResponseDTO getBrandSentimentAnalysis(DashBoardRequestDTO dashBoardRequestDTO) {
        // 1. 데이터 범위 설정
        LocalDate sevenDayStats = LocalDate.now().minusDays(6);
        LocalDate endDate = LocalDate.now();
        String dateRange = sevenDayStats.toString() + " ~ " + endDate.toString();

        // 2. 데이터 조회
        List<AnalyticsKeywordSentimentDailyStats> stats = analyticsKeywordSentimentDailyStatsRepository.findAllByBrandIdAndDateBetween(
                dashBoardRequestDTO.getBrandId(), sevenDayStats, endDate, dashBoardRequestDTO.getContentChannel()
        );

        // 데이터가 없을 경우 방어 코드
        if (stats.isEmpty()) {
            return BrandSentimentResponseDTO.builder()
                    .dateRange(dateRange)
                    .mostPositiveDate("-").mostNegativeDate("-").topSource("-")
                    .posValue(0.0).negValue(0.0).neuValue(0.0)
                    .averagePositiveRatio("0.0%")
                    // 만약 DTO에 아래 필드들이 추가되어 있다면 함께 세팅하세요
                    // .averageNegativeRatio("0.0%").averageNeutralRatio("0.0%")
                    .build();
        }

        // 3. 피크 날짜 산출
        LocalDate mostPositiveDate = stats.stream()
                .max(Comparator.comparing(AnalyticsKeywordSentimentDailyStats::getPositiveRatio))
                .map(AnalyticsKeywordSentimentDailyStats::getStatDate).orElse(null);

        LocalDate mostNegativeDate = stats.stream()
                .max(Comparator.comparing(AnalyticsKeywordSentimentDailyStats::getNegativeRatio))
                .map(AnalyticsKeywordSentimentDailyStats::getStatDate).orElse(null);

        // 4. 주요 소스 산출
        String topSource = stats.stream()
                .collect(Collectors.groupingBy(
                        AnalyticsKeywordSentimentDailyStats::getSource,
                        Collectors.summingDouble(s -> s.getPositiveRatio() + s.getNegativeRatio())
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("-");

        // 5. 수치 계산 및 100% 보정
        double avgPos = stats.stream().mapToDouble(AnalyticsKeywordSentimentDailyStats::getPositiveRatio).average().orElse(0.0);
        double avgNeg = stats.stream().mapToDouble(AnalyticsKeywordSentimentDailyStats::getNegativeRatio).average().orElse(0.0);

        // 반올림 숫자 생성 (차트용 Double)
        double roundedPos = Math.round(avgPos * 10) / 10.0;
        double roundedNeg = Math.round(avgNeg * 10) / 10.0;
        // 긍정+부정을 뺀 나머지를 중립으로 할당 (합계 100% 보장)
        double roundedNeu = Math.round((100.0 - (roundedPos + roundedNeg)) * 10) / 10.0;

        // 6. 최종 DTO 빌드
        return BrandSentimentResponseDTO.builder()
                .dateRange(dateRange)
                .mostPositiveDate(mostPositiveDate != null ? mostPositiveDate.toString() : "-")
                .mostNegativeDate(mostNegativeDate != null ? mostNegativeDate.toString() : "-")
                .topSource(topSource)

                // [Double 필드] 차트 데이터용
                .posValue(roundedPos)
                .negValue(roundedNeg)
                .neuValue(roundedNeu)

                // [String 필드] 화면 텍스트 표시용
                .averagePositiveRatio(String.format("%.1f%%", roundedPos))
                // DTO에 부정/중립 String 필드도 있다면 추가하세요
                .build();
    }
    //긍 부정 추이 차트---------------------------------------------------------------------------------------

    @Override
    public BrandAllChartResponseDTO getBrandSentimentChart(DashBoardRequestDTO dashBoardRequestDTO) {
        // 1. 기간 설정: 오늘 포함 최근 7주차의 월요일부터 시작
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusWeeks(6).with(DayOfWeek.MONDAY);

        // DB 조회 (7주치 데이터)
        List<AnalyticsKeywordSentimentDailyStats> sentimentData = analyticsKeywordSentimentDailyStatsRepository
                .findAllByBrandIdAndDateBetween(dashBoardRequestDTO.getBrandId(), startDate, endDate, dashBoardRequestDTO.getContentChannel());

        // 2. 주간 집계용 Map (Key: 해당 주의 월요일 날짜)
        Map<LocalDate, BrandSentimentChartDataDTO> statsMap = new HashMap<>();

        for (AnalyticsKeywordSentimentDailyStats stats : sentimentData) {
            // 모든 날짜를 해당 주의 '월요일'로 치환하여 그룹화
            LocalDate weekKey = stats.getStatDate().with(DayOfWeek.MONDAY);

            BrandSentimentChartDataDTO data = statsMap.getOrDefault(weekKey,
                    new BrandSentimentChartDataDTO(weekKey.toString(), 0.0, 0.0, 0.0));

            // 해당 주의 긍정/부정/중립 비중을 누적 합산
            data.setPositive(data.getPositive() + (stats.getPositiveRatio() / 100.0));
            data.setNegative(data.getNegative() + (stats.getNegativeRatio() / 100.0));
            data.setNeutral(data.getNeutral() + (stats.getNeutralRatio() / 100.0));

            statsMap.put(weekKey, data);
        }

        // 3. 결과 리스트 생성 (7개의 주차 막대 보장)
        List<BrandSentimentChartDataDTO> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate currentWeek = startDate.plusWeeks(i);

            BrandSentimentChartDataDTO chartData = statsMap.getOrDefault(currentWeek,
                    new BrandSentimentChartDataDTO(currentWeek.toString(), 0.0, 0.0, 0.0));

            // 차트 하단 날짜 표시 형식 설정 (예: 01/05 주차)
            chartData.setDate(currentWeek.format(DateTimeFormatter.ofPattern("MM/dd")) + " 주차");

            result.add(chartData);
        }

        return BrandAllChartResponseDTO.builder()
                .sentiment(result)
                .build();
    }


    //C워드 클라우드-------------------------------------------------------------------------

    @Override
    public BrandWordCloudResponseDTO getBrandWordCloudData(DashBoardRequestDTO dashBoardRequestDTO) {

        // 1. 데이터 범위 설정
        LocalDate sevenDayStats = LocalDate.now().minusDays(6);
        LocalDate endDate = LocalDate.now();

        List<Object[]> wordCloudRow = analyticsKeywordTokenSentimentStatsRepository.findWordCloudData(
                dashBoardRequestDTO.getBrandId(),
                sevenDayStats,
                endDate,
                dashBoardRequestDTO.getContentChannel()
        );

        List<BrandWordCloudDTO> words = wordCloudRow.stream()
                .map(result -> BrandWordCloudDTO.builder()
                        .text((String) result[0])
                        .value(((Number) result[1]).longValue())
                        .polarity(String.valueOf(result[2])) // POS, NEG 등
                        .build())
                .collect(Collectors.toList());

        return BrandWordCloudResponseDTO.builder()
                .wordCloudRow(words).build();
    }
}