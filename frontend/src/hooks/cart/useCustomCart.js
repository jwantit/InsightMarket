import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react"; // useCallback 임포트 추가
import { getCartItemsAsync, addSolutionToCartAsync, removeCartItemAsync } from "../../store/slices/cartSlice";

const useCustomCart = (projectId) => {


  const cartState = useSelector((state) => state.cartSlice);

  
  const dispatch = useDispatch();

  // refreshCart 함수를 useCallback으로 감싸고, projectId와 dispatch를 의존성으로 추가합니다.
  const refreshCart = useCallback(() => {
    if (projectId) {
      dispatch(getCartItemsAsync(projectId));
    }
  }, [dispatch, projectId]); // projectId가 변경될 때만 함수가 다시 생성됨

  // addCartItem도 useCallback으로 감쌉니다.
  const addCartItem = useCallback((itemDTO) => {
    dispatch(addSolutionToCartAsync(itemDTO)); // 장바구니 추가 후 새로고침
  }, [dispatch, refreshCart]); // refreshCart도 의존성으로 추가

  // removeCartItem도 useCallback으로 감쌉니다.
  const removeCartItem = useCallback((cartItemid) => {
    dispatch(removeCartItemAsync(cartItemid));// 장바구니 삭제 후 새로고침
  }, [dispatch, refreshCart]); // refreshCart도 의존성으로 추가

  return { cartState, refreshCart, addCartItem, removeCartItem };
};

export default useCustomCart;
