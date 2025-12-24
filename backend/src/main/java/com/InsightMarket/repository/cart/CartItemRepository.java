package com.InsightMarket.repository.cart;

import com.InsightMarket.domain.cart.CartItem;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.cart.CartItemListDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {


    //동일한 상품 검사
    @Query("select ci from CartItem ci " +
            "where ci.cart.project.id = :projectid " +
            "and ci.solution.id = :solutionid")
    public CartItem getItemOfSolution(@Param("projectid") Long projectid, @Param("solutionid") Long solutionid);


    //아이템 리스트
    @Query("select new com.InsightMarket.dto.cart.CartItemListDTO(" +
            " ci.id, " +            // CartItem의 PK
            " s.id, " +            // Solution의 PK
            " s.title, " +  // Solution 이름
            " s.price, " +          // Solution 가격
            " s.description " +
            ") " +
            "from CartItem ci " +
            "join ci.cart c " +  //CartItem.cart
            "join ci.solution s " +//CartItem.solution
            "where c.project.id = :projectid " + //cart.project.id와 내가 요청한 id와 같은것 반환
            "order by ci.id desc")
    public List<CartItemListDTO> getItemsOfCartDTOByProjectId(@Param("projectid") Long projectid);

//--------------------------------------------------------------------------------------------------------------
//장바구니 아이템이 어느 장바구니(cart)에 속해 있는지 찾기
    //Cart id를 가져온다 아이템과 연관있는
@Query("select cartitem.cart.id from CartItem cartitem where cartitem.id = :cartItemId")
Long getCartFromItem(@Param("cartItemId") Long cartItemId);



//장바구니에 속한 아이템 다시 가져오기
    @Query("""
    select new com.InsightMarket.dto.cart.CartItemListDTO(
        ci.id,             
        s.id,              
        s.title,    
        s.price,
        s.description
    )
    from CartItem ci
        join ci.cart c        
        join ci.solution s     
    where c.id = :cartId       
    order by ci.id desc     """)
    List<CartItemListDTO> getItemsOfCartDTOByCart(@Param("cartId") Long cartId);



}
