package com.InsightMarket.domain.common;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Data
public class PageResponseDTO<E> {

    private List<E> dtoList;

    private List<Integer> pageNumList;

    private PageRequestDTO pageRequestDTO;

    private boolean prev, next;

    private int totalCount, prevPage, nextPage, totalPage, current;

    @Builder(builderMethodName = "withAll")
    public PageResponseDTO(List<E> dtoList, PageRequestDTO pageRequestDTO, long totalCount) {

        this.dtoList = dtoList;
        this.pageRequestDTO = pageRequestDTO;
        this.totalCount = (int)totalCount;

        int end =   (int)(Math.ceil( pageRequestDTO.getPage() / 10.0 )) *  10;  //page = 1/10 -> 0.1 -> 1 * 10 = 10 페이지 묶음

        int start = end - 9; //20 - 9 현재페이지 = 11

        //전체 데이터를 size 만큼 나눴을 때 총 몇 페이지가 필요한지를 계산
        int last =  (int)(Math.ceil((totalCount/(double)pageRequestDTO.getSize()))); //전체 46 / 10 = 5page 필요

        end =  end > last ? last: end; //20 > 5 참일시 end는 5page

        this.prev = start > 1; //현재페이지가 1보다 크면 (TRUE)  이전페이지


        this.next =  totalCount > end * pageRequestDTO.getSize();

        this.pageNumList = IntStream.rangeClosed(start,end).boxed().collect(Collectors.toList());

        if(prev) {
            this.prevPage = start -1;
        }

        if(next) {
            this.nextPage = end + 1;
        }

        this.totalPage = this.pageNumList.size();

        this.current = pageRequestDTO.getPage();

    }
}