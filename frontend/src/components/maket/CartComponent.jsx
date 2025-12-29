import { useState, useEffect, useMemo } from "react";
import CartItemComponent from "./CartItemComponent";
import useCustomCart from "../../hooks/useCustomCart";
import usePayment from "../../hooks/common/payment/useCustomPayment";

const CartComponent = ({ projectId }) => {
  const { cartState, removeCartItem, refreshCart, addCartItem } = useCustomCart(projectId); // projectId 인자 전달, refreshCart와 addCartItem 가져옴
  const { items } = cartState; 
  const [selectedSolutionIds, setSelectedSolutionIds] = useState([]);
  const { handlePayment } = usePayment();


  

  useEffect(() => {
    if (projectId) {
      refreshCart(); // projectId가 유효할 때만 refreshCart 호출
      setSelectedSolutionIds([]); //프로젝트 변경시 선택 상태 초기화
      console.error("장바구니니", cartState);
    }
  }, [projectId]); // refreshCart 함수가 useCallback으로 감싸져 있으므로 안전합니다.
  console.log("cartState" , items)

  //사용자가 체크시      솔루션id 담거나 중복시 제외하기 
  const handleToggle = (solutionId) => {
    setSelectedSolutionIds((prev) => //prev -> selectedSolutionIds의 최신값 
      prev.includes(solutionId) //prev.includes 내부에 solutionId이 있는지 확인 
        ? prev.filter((id) => id !== solutionId) //있으면 prev 값을 하나씩 꺼내서 전달한 solutionId 와 다른것들만 set한다.
        : [...prev, solutionId] //없으면 selectedSolutionIds 전체를 가져오고  전달한 solutionId를 추가한다.
    );
  };

  //총합계산 프론트에서만 실제로는 백엔드에서 가격처리 
  const selectedTotalPrice = useMemo(() => {
    return items
      .filter(item => selectedSolutionIds.includes(item.solutionid))
      .reduce((sum, item) => sum + (item.solutionprice || 0), 0);
  }, [items, selectedSolutionIds]);

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
          isChecked={selectedSolutionIds.includes(item.solutionid)}//includes 안에 있는지 확인 item.solutionid가 있으면 체크되어있다.
          onToggle={handleToggle} //solutionId 담기
          onRemove={removeCartItem} //삭제
        />
      ))}

      {/* 총 금액 및 결제 버튼 */}
      {items.length > 0 && (
        <div className="bg-gray-50 border-t px-4 py-4 flex flex-col items-end space-y-3">
          <div className="text-lg font-bold text-gray-800">
            총 결제 금액: <span className="text-blue-600">{selectedTotalPrice.toLocaleString()}원</span>
          </div>
          <button
             onClick={async () => { // 1. async 추가
                    if (selectedSolutionIds.length === 0) {
                    alert("결제할 상품을 선택해주세요.");
                    return;
                    }

                     const formattedList = selectedSolutionIds.map(id => ({
                     solutionid: id 
                      }));

                     try {
                     // 2. await 추가: 결제가 완전히 끝날 때까지 기다립니다.
                     const isSuccess = await handlePayment(projectId, formattedList);

     
                      if (isSuccess) {
                        const cartItemIdsToDelete = items
                        .filter(item => selectedSolutionIds.includes(item.solutionid))
                        .map(item => item.cartitemid); // items 내의 실제 카트 아이템 PK 추출

                       setSelectedSolutionIds([]); //선택상태비우기

                       if (cartItemIdsToDelete.length > 0) {
                        try {
                          await removeCartItem(cartItemIdsToDelete); 
                        } catch (delError) {
                          console.error("장바구니 삭제 중 오류 발생:", delError);
                        }
                       }
                      
      }
    } catch (error) {
      console.error("결제 진행 중 에러:", error);
    }
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