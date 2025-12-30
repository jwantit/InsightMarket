package com.InsightMarket.service.cart;


import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.cart.Cart;
import com.InsightMarket.domain.cart.CartItem;
import com.InsightMarket.domain.project.Project;
import com.InsightMarket.domain.solution.Solution;
import com.InsightMarket.dto.cart.CartItemDTO;
import com.InsightMarket.dto.cart.CartItemListDTO;
import com.InsightMarket.repository.cart.CartItemRepository;
import com.InsightMarket.repository.cart.CartRepository;
import com.InsightMarket.repository.project.ProjectRepository;
import com.InsightMarket.repository.solution.SolutionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProjectRepository projectRepository;
    private final SolutionRepository solutionRepository;


    @Override
    public List<CartItemListDTO> addSolutionToCart(CartItemDTO cartItemDTO) {

        Long projectid = cartItemDTO.getProjectid();
        Long solutionid = cartItemDTO.getSolutionid();

        Cart cart = getCart(projectid);

        CartItem cartItem = null;
        //동일상품검사
        cartItem = cartItemRepository.getItemOfSolution(projectid, solutionid);

        if (cartItem == null) {
            Solution solution = solutionRepository
                    .findSolutionOfProject(solutionid, projectid)
                    .orElseThrow(() ->
                            new ApiException(ErrorCode.SOLUTION_NOT_IN_PROJECT)
                    );

            cartItem = CartItem.builder()
                    .solution(solution)
                    .cart(cart)
                    .build();

            cartItemRepository.save(cartItem);
        }

        return getCartItems(projectid);
    }


    //카트아이템 전부 가져오기
    @Override
    public List<CartItemListDTO> getCartItems(Long projectid) {
        return cartItemRepository.getItemsOfCartDTOByProjectId(projectid);
    }

    //장바구니 없으면 생성하여 반환
    private Cart getCart(Long projectid) {
        return cartRepository.getCartOfProject(projectid)
                .orElseGet(() -> {
                    log.info("해당 프로젝트의 장바구니가 없어 새로 생성합니다.");

                    Project project = projectRepository.findById(projectid)
                            .orElseThrow(() ->  new ApiException(ErrorCode.PROJECT_NOT_FOUND));

                    return cartRepository.save(Cart.builder().project(project).build());
                });
    }

    @Override
    public List<CartItemListDTO> cartItemremove(List<Long> cartItemids) {

        //CartItem을 통해 Cart의 id를 Long타입으로 받는다.
        Long cartId  = cartItemRepository.getCartFromItem(cartItemids.get(0));

        log.info("cart no: " + cartItemids);

        cartItemRepository.deleteAllByIdInBatch(cartItemids); //전부삭제


        //Cartid 를 통해 아이템 조회
        return cartItemRepository.getItemsOfCartDTOByCart(cartId); //다시조회
    }


}
