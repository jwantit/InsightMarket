import { API_SERVER_HOST } from "./memberApi";
import jwtAxios from "../util/jwtUtil";

const host = `${API_SERVER_HOST}/api/payment`; // 백엔드 결제 컨트롤러 경로

// 결제 준비 (Prepare) API 호출
export const prepareOrder = async (orderRequestDTO) => {
    // 백엔드 컨트롤러의 @PostMapping("/prepare")와 매칭
    const res = await jwtAxios.post(`${host}/prepare`, orderRequestDTO);
    return res.data;
};

//결제SDK에서 나가거나 할시 취소시
export const delOrder = async (oderId) => {
    // 백엔드 컨트롤러의 @PostMapping("/prepare")와 매칭
    const res = await jwtAxios.delete(`${host}/del/${oderId}`);
    return res.data;
};

//결제성공후 검증 (사후검증)
export const verifyPayment = async (paymentId, orderId) => {
    try {
        const res = await jwtAxios.post(`${host}/verify`, {
            paymentId: paymentId, // 포트원 결제 고유 번호
            orderId: orderId      // 우리 DB의 주문 PK
        });
        
        // 백엔드에서 검증이 성공하면 (200 OK) 데이터 반환
        return res.data; 
    } catch (error) {
        console.error("결제 검증 중 오류 발생:", error);
        throw error;
    }
};