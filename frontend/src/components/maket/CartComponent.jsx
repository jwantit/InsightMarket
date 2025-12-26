import { useState, useEffect } from "react";
import CartItemComponent from "./CartItemComponent";
import useCustomCart from "../../hooks/useCustomCart";

const CartComponent = ({ projectId }) => {
  const { cartState, removeCartItem, refreshCart, addCartItem } = useCustomCart(projectId); // projectId 인자 전달, refreshCart와 addCartItem 가져옴
  const { items, totalPrice } = cartState; 

  useEffect(() => {
    if (projectId) {
      refreshCart(); // projectId가 유효할 때만 refreshCart 호출
      console.error("장바구니니", cartState);
    }
  }, [projectId]); // refreshCart 함수가 useCallback으로 감싸져 있으므로 안전합니다.
  console.log("cartState" , items)

  return (
    <div className="border rounded-lg overflow-hidden mt-4">
    
      {/* 리스트 */}
      {items.length === 0 && (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">
          장바구니에 담긴 상품이 없습니다.
        </div>
      )}

      {items.map((item) => (
        <CartItemComponent
          key={item.cartItemid}
          item={item}
          onRemove={removeCartItem}
        />
      ))}

      {/* 총 금액 및 결제 버튼 */}
      {items.length > 0 && (
        <div className="bg-gray-50 border-t px-4 py-4 flex flex-col items-end space-y-3">
          <div className="text-lg font-bold text-gray-800">
            총 결제 금액: <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
          </div>
          <button
            onClick={() => {
              alert("결제 기능은 추후 구현 예정입니다.");
            }}
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-bold text-lg"
          >
            결제하기
          </button>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
