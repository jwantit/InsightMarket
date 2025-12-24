package com.InsightMarket.service.cart;

import com.InsightMarket.dto.cart.CartItemDTO;
import com.InsightMarket.dto.cart.CartItemListDTO;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CartService {

    //장바구니 아이템 추가 혹은 장바구니 생성
    List<CartItemListDTO> addSolutionToCart(CartItemDTO cartItemDTO);

    //장바구니 아이템 조회
    List<CartItemListDTO> getCartItems(Long projectid);

    List<CartItemListDTO> cartItemremove(Long cartItemid);
}
