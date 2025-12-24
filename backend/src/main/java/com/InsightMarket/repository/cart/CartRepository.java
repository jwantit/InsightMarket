package com.InsightMarket.repository.cart;

import com.InsightMarket.domain.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long>{
    @Query("select cart from Cart cart where cart.project.id = :projectid")
    public Optional<Cart> getCartOfProject(@Param("projectid") Long projectid);
}
