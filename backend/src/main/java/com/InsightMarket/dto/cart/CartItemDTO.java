package com.InsightMarket.dto.cart;

import lombok.Data;

@Data// 장바구니  아이템 추가/수정/삭제용 DTO
public class CartItemDTO {

    private Long projectid;

    private Long solutionid;

    private Long cartItemid;

}