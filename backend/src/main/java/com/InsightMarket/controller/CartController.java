package com.InsightMarket.controller;


import com.InsightMarket.dto.cart.CartItemDTO;
import com.InsightMarket.dto.cart.CartItemListDTO;
import com.InsightMarket.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public List<CartItemListDTO> addCartOrCartitem(@RequestBody CartItemDTO itemDTO) {
        log.info("장바구니 를 추가하거나 아이템을 추가하였습니다.");
        return cartService.addSolutionToCart(itemDTO);
    }

    @DeleteMapping("/del/{cartItemid}")
    public List<CartItemListDTO> removeCart(@PathVariable("cartItemid") Long cartItemid) {
        log.info("카트 아이템을 삭제 했습니다.");
        return cartService.cartItemremove(cartItemid);
    }

    @GetMapping("/item")
    public List<CartItemListDTO> getAllCartItems(Long projectid) {
        return cartService.getCartItems(projectid);
    }
}
