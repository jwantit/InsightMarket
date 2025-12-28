import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCookie, removeCookie, setCookie } from "../../util/cookieUtil";
import { loginPost } from "../../api/memberApi";

//쿠키 없을 때 사용할 기본 로그인 상태
const initState = {
  email: "",
};

//브라우저 쿠키에서 로그인 정보를 가져와서 초기 상태로 사용
//즉, 새로고침 시 쿠키를 읽어 로그인 상태 유지
const loadMemberCookie = () => {
  //쿠키에서 로그인 정보 로딩
  const memberInfo = getCookie("member");

  //닉네임 처리하여 사용자가 입력한 값중에 특수문자나 공백이 포함되면 디코딩하여 제대로 된 형태로 표시
  if (memberInfo && memberInfo.name) {
    memberInfo.name = decodeURIComponent(memberInfo.name);
  }
  return memberInfo;
};

//createAsyncThunk -> RTK가 자동으로 pending, fulfilled, rejected 액션을 만들어 줌
//사용 목적: 서버 로그인 API 호출 + 상태 관리
// export const loginPostAsync = createAsyncThunk("loginPostAsync", (param) => {
//   return loginPost(param); //memberApi.js에서 Axios POST 요청
// });

export const loginPostAsync = createAsyncThunk(
  "loginPostAsync",
  async (param, { rejectWithValue }) => {
    try {
      const res = await loginPost(param);
      return res;
    } catch (e) {
      console.log(e.response?.data);
      return rejectWithValue(e.response?.data);
    }
  }
);

//loginSlice.getState().login 으로 상태 접근 가능
const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: loadMemberCookie() || initState, // 쿠키가 없다면 초깃값 사용
  reducers: {
    //동기 액션 처리
    login: (state, action) => {
      console.log("login....");

      // 소셜 로그인 회원이 사용
      const payload = action.payload;
      setCookie("member", JSON.stringify(payload), 1); // 1일

      return payload;
    },
    logout: (state, action) => {
      console.log("logout....");
      removeCookie("member");
      return { ...initState }; //Redux state 초기화 + 쿠키 삭제
    },
    updateProfile: (state, action) => {
      const { name } = action.payload;

      const next = {
        ...state,
        name,
      };

      // 쿠키도 함께 갱신해야 새로고침/Topbar에 바로 반영됨
      setCookie("member", JSON.stringify(next), 1);
      return next;
    },
  },
  extraReducers: (builder) => {
    //createAsyncThunk에서 생성된 비동기 액션 처리
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        //로그인 요청 성공 시 실행
        console.log("fulfilled");
        const payload = action.payload;

        // 정상적인 로그인시에만 저장
        if (!payload.error) {
          setCookie("member", JSON.stringify(payload), 1); //1일 //서버에서 받은 데이터(payload)를 쿠키에 저장
        }

        return payload; //Slice 상태도 payload로 업데이트
      })
      .addCase(loginPostAsync.pending, (state, action) => {
        //로그인 요청 중
        console.log("pending");
      })
      .addCase(loginPostAsync.rejected, (state, action) => {
        //로그인 요청 실패
        console.log("rejected");
      });
  },
});

export const { login, logout, updateProfile } = loginSlice.actions; //Slice 안에서 정의한 동기 액션 login, logout export
export default loginSlice.reducer; //이 Slice의 리듀서를 외부에서 import해서 Store에 등록하겠다
