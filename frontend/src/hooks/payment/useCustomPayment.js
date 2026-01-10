import { prepareOrder, delOrder, verifyPayment } from "../../api/paymentApi";
import { getErrorMessage } from "../../util/errorUtil";

const useCustomPayment = () => {
  //결제버튼 -> 호출______________________________________________________________________________________
  const handlePayment = async (projectId, solutionList) => {
    console.log("1. 백엔드 주문 준비 요청:", { projectId, solutionList });

    try {
      //------------------------------------
      // DTO 구조로 가공
      const orderRequest = {
        projectId: projectId,
        solutions: solutionList.map((sol) => ({
          solutionId: sol.solutionid,
        })),
      }; //------------------------------------

      // 사전등록 단계 -> 주문서생성(Oders, 주문아이템)//----------------------------
      // 백엔드 검증 준비 DB에 사전 등록하고 결제에 필요한 정보(merchantUid 등)를 받아옴
      const responseData = await prepareOrder(orderRequest);
      //-----------------------------------------------------------------------

      // 결제창 띄우기 백엔드 데이터를 가지고 V2 실행------------------------------
      return await openPortoneV2(responseData);
      // 결제창 띄우기 백엔드 데이터를 가지고 V2 실행-------------------------------
    } catch (error) {
      console.error("결제 준비 실패:", error);
      alert("주문 정보를 생성하는 중 오류가 발생했습니다.");
    }
  };
  //______________________________________________________________________________________

  // 포트원 V2 실제 결제창 실행 로직-----------------------------------------
  const openPortoneV2 = async (data) => {
    console.log("포트원으로 넘기기 직전 data:", data); //
    try {
      // V2는 window.PortOne.requestPayment를 사용하며 await로 결과를 받습니다.
      const response = await window.PortOne.requestPayment({
        storeId: "store-a7a2d147-1c34-4bb8-94cd-aa9242709a39",
        channelKey: "channel-key-a77be428-a89c-4057-b337-14a04806c89d",
        paymentId: data.merchantUid, // 백엔드에서 생성해준 주문고유번호
        orderName: data.orderName, // 상품명
        totalAmount: data.totalAmount, // 총 금액
        currency: "CURRENCY_KRW",
        payMethod: "CARD", // 토스페이먼츠 카드결제창
        customer: {
          fullName: data.buyerName, // 구매자 이름
        },
      });

      // V2 응답 처리 (오류가 발생하면 response.code가 존재함)

      //오류란 결제창을 종료시
      if (response.code !== undefined) {
        //결제창을 그냥 닫았거나 카드 오류로 돈이 안 나감.
        alert(`결제 취소`);
        try {
          await delOrder(data.orderId); //주문서 삭제
        } catch (error) {
          console.error("주문서 삭제 중 오류 발생:", error);
        }
        return false; // 실패했으므로 false 반환

        //response.paymentId 공식 영수증 번호 결제(성공)후 사후검증단계 진행 ---------------------------------------------------
      } else if (response.paymentId) {
        try {
          //사후검증단계 진행
          await verifyPayment(response.paymentId, data.orderId);
          alert(`결제 성공`);
          return true;
        } catch (error) {
          //검증실패
          console.error("검증 실패 상세:", error);
          alert(getErrorMessage(error, "결제 검증 중 오류가 발생했습니다."));
          return false;
        }
      }

      //조건문에도 해당하지 않는 오류를 담당
    } catch (error) {
      console.error("결제창 호출 에러:", error);
      alert("결제창을 띄우는 중 오류가 발생했습니다.");
    }
  };

  return { handlePayment };
};

export default useCustomPayment;
