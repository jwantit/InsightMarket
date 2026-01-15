package com.InsightMarket.dto;

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

        this.dtoList = dtoList; //솔루션 객체모음 SolutionDTO
        this.pageRequestDTO = pageRequestDTO; //page = 1 size = 10 projectid; 등
        this.totalCount = (int)totalCount; //총데이터 개수

        //어느블록에 속해있는지1~10 11~20                   12  / 10 -> 1.2 -> 2 * 10 = 20
        int end =   (int)(Math.ceil( pageRequestDTO.getPage() / 10.0 )) *  10;  //page = 1/10 -> 0.1 -> 1 * 10 = 10 페이지 묶음
        //페이지 묶음의 시작
        int start = end - 9; //20 - 9 묶음 11 ~20

        //전체 데이터를 size 만큼 나눴을 때 총 몇 페이지가 필요한지를 계산
                                         //35            10.0  = 4페이지
        int last =  (int)(Math.ceil((totalCount/(double)pageRequestDTO.getSize()))); //전체 46 / 10 = 5page 필요

        end =  end > last ? last: end; //end는 무조건 10페이지 가 마지막이다 블록을 만든다 last는 실제 페이지수이며
                                      // end 즉 10페이지가 last보다 클시 last 값을 사용한다 묶음의 끝은

        this.prev = start > 1; //현재페이지가 1페이지 보다 크면 이전으로 이동 버튼을 활성화 가기위한 플래그


        this.next =  totalCount > end * pageRequestDTO.getSize(); //현재페이지묶음 이후 데이터 여부 플래그

        //start ~ end 범위의 정수를 모두 생성 프론트에서 페이지 선택
        this.pageNumList = IntStream.rangeClosed(start,end).boxed().collect(Collectors.toList());

        //"이전 페이지 묶음" 버튼을 클릭했을 때 이동할 페이지 번호를 계산
        if(prev) {
            this.prevPage = start -1;
        }

        //다음 페이지 묶음이 존재할 경우,그 묶음의 첫 페이지로 이동하기 위한 번호를 저장하는 코드
        if(next) {
            this.nextPage = end + 1;
        }

        //→ 현재 페이지 묶음에서
        //→ UI에 표시할 페이지 번호의 개수
        this.totalPage = this.pageNumList.size();

        //현재 요청한 페이지 번호를 저장하는 코드
        this.current = pageRequestDTO.getPage();

    }
}