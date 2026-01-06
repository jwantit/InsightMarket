package com.InsightMarket.dashboard;

import com.InsightMarket.dashboard.dto.*;

public interface DashBoardService {
     //A. 언급량 최종 데이터
    public BrandMentionSummaryResponseDTO getBrandDailyAnalysis(DashBoardRequestDTO dashBoardRequestDTO);
    // A. 언급량 추이 차트 데이터 (일별/주별/월별 추이)
    public BrandAllChartResponseDTO getBrandMentionChart(DashBoardRequestDTO dashBoardRequestDTO);

    //B. 긍 부정
    public BrandSentimentResponseDTO getBrandSentimentAnalysis(DashBoardRequestDTO dashBoardRequestDTO);

    //C.워드 클라우드
    public BrandWordCloudResponseDTO getBrandWordCloudData(DashBoardRequestDTO dashBoardRequestDTO);

    //B. 긍 부정 추이 차트
    BrandAllChartResponseDTO getBrandSentimentChart(DashBoardRequestDTO dashBoardRequestDTO);





}
