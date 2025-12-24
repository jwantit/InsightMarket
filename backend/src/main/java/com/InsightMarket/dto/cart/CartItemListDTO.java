package com.InsightMarket.dto.cart;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CartItemListDTO {

    private Long cartitemid;

    private Long solutionid;

    private String solutiontitle;

    private int solutionprice;

    private String imageUrl;

    private String solutionDescription;

    public CartItemListDTO(Long cartitemid,Long solutionid, String solutiontitle, int price, String solutionDescription){
        this.cartitemid = cartitemid;
        this.solutionid = solutionid;
        this.solutiontitle = solutiontitle;
        this.solutionprice = price;
        this.solutionDescription = solutionDescription;
    }

}
