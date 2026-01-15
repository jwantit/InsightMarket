package com.InsightMarket.ai.dto.locationchatbot;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationRequestDTO {

    //분류
    private String category;

    //위치 위도 경도--------
    private double latitude;// 위도
    private double longitude;// 경도
    //----------------------

    //범위
    private Long radius;

    //주소
    private String address;

    //Id best, worst 둘다
    private String placeId;
    //Id 고정 worst
    private String worstPlaceId;
}
