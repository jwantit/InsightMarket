import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CartItemComponent from "./CartItemComponent";
import useCustomCart from "../../hooks/cart/useCustomCart";
import usePayment from "../../hooks/payment/useCustomPayment";
import { useBrand } from "../../hooks/brand/useBrand";
import { showAlert } from "../../hooks/common/useAlert";

const CartComponent = ({ projectId }) => {
  const { cartState, removeCartItem, refreshCart, addCartItem } =
    useCustomCart(projectId); // projectId 인자 전달, refreshCart와 addCartItem 가져옴
  const { items } = cartState;
  const [selectedSolutionIds, setSelectedSolutionIds] = useState([]);
  const { handlePayment } = usePayment();
  const navigate = useNavigate();
  const { brandId } = useBrand();

  useEffect(() => {
    if (projectId) {
      refreshCart(); // projectId가 유효할 때만 refreshCart 호출
      setSelectedSolutionIds([]); //프로젝트 변경시 선택 상태 초기화
      console.error("장바구니니", cartState);
    }
  }, [projectId]); // refreshCart 함수가 useCallback으로 감싸져 있으므로 안전합니다.
  console.log("cartState", items);

  //사용자가 체크시      솔루션id 담거나 중복시 제외하기
  const handleToggle = (solutionId) => {
    setSelectedSolutionIds(
      (
        prev //prev -> selectedSolutionIds의 최신값
      ) =>
        prev.includes(solutionId) //prev.includes 내부에 solutionId이 있는지 확인
          ? prev.filter((id) => id !== solutionId) //있으면 prev 값을 하나씩 꺼내서 전달한 solutionId 와 다른것들만 set한다.
          : [...prev, solutionId] //없으면 selectedSolutionIds 전체를 가져오고  전달한 solutionId를 추가한다.
    );
  };

  //총합계산 프론트에서만 실제로는 백엔드에서 가격처리
  const selectedTotalPrice = useMemo(() => {
    return items
      .filter((item) => selectedSolutionIds.includes(item.solutionid))
      .reduce((sum, item) => sum + (item.solutionprice || 0), 0);
  }, [items, selectedSolutionIds]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* 빈 상태 */}
      {items.length === 0 && (
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 mb-1">
                장바구니에 담긴 상품이 없습니다.
              </p>
              <p className="text-xs text-slate-400">
                상품목록에서 원하는 솔루션을 장바구니에 추가하세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 리스트 */}
      {items.map((item, idx) => (
        <CartItemComponent
          key={item.cartItemid}
          item={item}
          isChecked={selectedSolutionIds.includes(item.solutionid)}
          onToggle={handleToggle}
          onRemove={removeCartItem}
          isFirst={idx === 0}
        />
      ))}

      {/* 총 금액 및 결제 버튼 */}
      {items.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-6 flex flex-col items-end space-y-4">
          <div className="text-xl font-black text-slate-900">
            총 결제 금액:{" "}
            <span className="text-blue-600">
              {selectedTotalPrice.toLocaleString()}원
            </span>
          </div>
          <button
            onClick={async () => {
              if (selectedSolutionIds.length === 0) {
                await showAlert("결제할 상품을 선택해주세요.", "warning");
                return;
              }

              const formattedList = selectedSolutionIds.map((id) => ({
                solutionid: id,
              }));

              try {
                const isSuccess = await handlePayment(projectId, formattedList);

                if (isSuccess) {
                  const cartItemIdsToDelete = items
                    .filter((item) =>
                      selectedSolutionIds.includes(item.solutionid)
                    )
                    .map((item) => item.cartitemid);

                  setSelectedSolutionIds([]);

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
            className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-base transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            결제하기
          </button>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
