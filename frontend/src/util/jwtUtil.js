import axios from "axios";
import { getCookie, setCookie } from "./cookieUtil";
import { API_SERVER_HOST } from "../api/memberApi";

//Axios 인스턴스를 새로 생성
//이 인스턴스를 통해 서버 요청 시 JWT 토큰 자동 삽입 + 갱신 로직을 적용
const jwtAxios = axios.create();

//AccessToken이 만료됐을 때 RefreshToken으로 새 토큰 발급 요청
const refreshJWT = async (accessToken, refreshToken) => {
  const host = API_SERVER_HOST;

  const header = { headers: { Authorization: `Bearer ${accessToken}` } };

  const res = await axios.get(
    `${host}/member/refresh?refreshToken=${refreshToken}`,
    header
  );

  console.log("----------------------");
  console.log(res.data);

  return res.data;
};

//요청 보내기 전 자동 실행되는 함수
//before request
const beforeReq = (config) => {
  console.log("before request.............");
  const memberInfo = getCookie("member"); //브라우저 쿠키에서 member 정보 가져오기

  if (!memberInfo) {
    //없으면 REQUIRE_LOGIN 에러 반환
    console.log("Member NOT FOUND");
    return Promise.reject({ response: { data: { error: "REQUIRE_LOGIN" } } });
  }

  const { accessToken } = memberInfo; //AccessToken이 있으면 Authorization: Bearer ... 헤더에 삽입

  // Authorization
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};

//요청 중 에러 발생 시 호출, beforeReq 호출 시 에러발생하면 이 함수 실행
//fail request
const requestFail = (err) => {
  console.log("request error............");

  return Promise.reject(err);
};

//서버 응답을 받은 후 자동 실행
//before return response
const beforeRes = async (res) => {
  console.log("before return response...........");
  //'ERROR_ACCESS_TOKEN'
  const data = res.data;

  //응답에 ERROR_ACCESS_TOKEN이 있으면 → AccessToken 만료
  if (data && data.error === "ERROR_ACCESS_TOKEN") {
    const memberCookieValue = getCookie("member");

    //RefreshToken으로 새 토큰 발급 (refreshJWT)
    const result = await refreshJWT(
      memberCookieValue.accessToken,
      memberCookieValue.refreshToken
    );
    console.log("refreshJWT RESULT", result);

    memberCookieValue.accessToken = result.accessToken;
    memberCookieValue.refreshToken = result.refreshToken;

    //쿠키 업데이트 (브라우저 쿠키에 새 토큰을 저장 : 클라이언트 상태 저장, 다음 요청에도 반영)
    setCookie("member", JSON.stringify(memberCookieValue), 1);

    //원래의 호출
    const originalRequest = res.config;

    //메모리상의 요청 객체에서 Authorization 값을 최신 토큰으로 업데이트
    originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;

    //원래 요청(originalRequest)을 새 AccessToken으로 다시 요청
    return await axios(originalRequest);
  }

  return res;
};

//fail response
const responseFail = (err) => {
  console.log("response fail error.............");
  return Promise.reject(err);
};

//Request Interceptor → 요청 전 실행 (beforeReq), 실패 시 에러 핸들러 등록 (requestFail)
jwtAxios.interceptors.request.use(beforeReq, requestFail);
//Response Interceptor → 응답 후 실행 (beforeRes), 실패 시 에러 핸들러 등록 (responseFail)
jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
