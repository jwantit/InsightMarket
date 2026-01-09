package com.InsightMarket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {

    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 10;

    private Long projectid;

    private String sort;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate from;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate to;

    //시작날짜 처리 //시작날짜가 없을시 1900년도로 설정
    public void setFromDefault() {
        if (this.from == null) {
            this.from = LocalDate.of(1900, 1, 1);

        }
    }

    //종료 날자 처리함수
    public void setToDefault() {
        if (this.to == null) {
            this.to = this.from.plusDays(1);
        }
    }
    public LocalDateTime getFromDateTime(){ //하루의 시작
        if (this.from == null) return null;
        return this.from.atStartOfDay();
    }
    public LocalDateTime getToDateTime(){ //하루의 끝
        if (this.to == null) return null;
        return this.to.atTime(LocalTime.MAX);

    }


}
