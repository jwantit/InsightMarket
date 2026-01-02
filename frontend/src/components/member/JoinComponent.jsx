import { useEffect, useState } from "react";
import { joinMember } from "../../api/memberApi";
import { getCompanies } from "../../api/companyApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import { getErrorMessage } from "../../util/errorUtil";
import BrandRegistrationModal from "./showBrandModal";
import { createBrand } from "../../api/brandApi";

const initState = {
  name: "",
  email: "",
  password: "",
  joinType: "NEW_COMPANY",
  companyName: "",
  businessNumber: "",//사업자번호 
  requestedCompanyId: "",
  brands: [],
};

const JoinComponent = () => {
  const [joinParam, setJoinParam] = useState({ ...initState });
  const [companies, setCompanies] = useState([]);

  const { moveToLogin } = useCustomLogin();



  //브랜드 생성 부분--------------------------------------------------------
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brands, setBrands] = useState([]);
  //테스트
  useEffect(() => {

    console.log("brands", brands);
  }, [brands]);
  //브랜드 생성 부분--------------------------------------------------------



  //수정추가 포인트
  //------------------------------------------------------
  // 브랜드 생성 버튼 누를시 모달열기 + brands가 비어있으면 빈 브랜드 필드 하나 추가
  const handleOpenBrandModal = () => {
    if (brands.length === 0) {
      setBrands([{ brandName: "", brandDescription: "", competitorName: "", competitorKeywords: "" }]);
    }
    setShowBrandModal(true); //모달 ON
  };
 //모달을 닫을시 브랜드 상태 초기화
  const handleCloseBrandModal = () => {
    setBrands([]); // 모달을 닫을 때 브랜드를 초기화
    setShowBrandModal(false);
  };
//브랜드 적용하기 모달에 생성한 브랜드를 set
  const handleSaveBrands = (newBrands) => {
    setBrands(newBrands);
    setShowBrandModal(false); //모달 OFF
  };
//-------------------------------------------------------
 


  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      console.log("companies raw:", data);
      setCompanies(data);
    } catch (e) {
      console.error("회사 목록 조회 실패", e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // 사업자 번호 필드일 때만 특수 로직 적용
    if (name === "businessNumber") {
      // 1. 숫자만 남기고 나머지 문자 제거
      const onlyNums = value.replace(/[^0-9]/g, "");
      
      // 2. 000-00-00000 포맷팅
      let formatted = "";
      if (onlyNums.length <= 3) {
        formatted = onlyNums;
      } else if (onlyNums.length <= 5) {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      } else {
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      }
  
      // 포맷팅된 값을 상태에 저장
      setJoinParam({
        ...joinParam,
        [name]: formatted,
      });
    } else {
      // 나머지 필드(이름, 이메일 등)는 기존 방식 그대로 유지
      setJoinParam({
        ...joinParam,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!joinParam.name || !joinParam.email || !joinParam.password) {
      alert("이름, 이메일, 비밀번호는 필수입니다.");
      return;
    }
    if (joinParam.joinType === "NEW_COMPANY" && !joinParam.companyName) {
      alert("새 회사명을 입력해주세요.");
      return;
    }
    //사업자 등록 번호 형식 체크------------------------------------------------------
    if (!joinParam.businessNumber || joinParam.businessNumber.length !== 12) {
      alert("사업자 등록 번호 형식에 맞지 않습니다. (10자리를 입력해주세요)");
      return;
    }
    //--------------------------------------------------------------------------------

    

    //브랜드 부분 추가 포인트------------------------------------------------------
    const hasValidBrand = brands.some(brand => 
      brand.brandName.trim() !== '' && 
      brand.competitorName.trim() !== '' && 
      brand.competitorKeywords.trim() !== ''
    );
    if (joinParam.joinType === "NEW_COMPANY" && !hasValidBrand) {
        alert("하나 이상의 유효한 브랜드를 등록해주세요.");
        return;
    }
     //브랜드 가공 --------------------------------------------------------

  const formattedBrands = brands
  .filter(b => b.brandName.trim() !== '') // 유효한 브랜드만 필터링
  .map(b => ({
    name: b.brandName,          // BrandRequestDTO.name
    description: b.brandDescription, // BrandRequestDTO.description
    competitors: [              // BrandRequestDTO.competitors (List<CompetitorDTO>)
      {
        name: b.competitorName, // CompetitorDTO.name
        // 콤마로 구분된 키워드를 배열로 변환: "애플, 삼성" -> ["애플", "삼성"]
        keywords: b.competitorKeywords 
          ? b.competitorKeywords.split(',').map(k => k.trim()).filter(k => k !== '') 
          : []
      }
    ]
  }));
 //브랜드 폼 
  const finalData = {
    ...joinParam,
    brands: formattedBrands // 백엔드 DTO 필드명이 'brand' (List<BrandRequestDTO>)
  };

    //브랜드 부분 추가 포인트------------------------------------------------------


    if (
      joinParam.joinType === "JOIN_COMPANY" &&
      !joinParam.requestedCompanyId
    ) {
      alert("가입할 회사를 선택해주세요.");
      return;
    }


    //회원가입
    //------------------------------------------------------
    try {
      await joinMember(finalData);
      alert("회원가입 요청이 완료되었습니다!");
      moveToLogin();
    } catch (e) {
      alert(getErrorMessage(e, "회원가입 실패"));
    }
    //------------------------------------------------------
  };




  return (
    <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8">
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <div className="text-2xl font-extrabold tracking-tight">
          Insight<span className="text-blue-600">Market</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          팀과 브랜드를 등록하고 시작하세요
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          이름
        </label>
        <input
          name="name"
          value={joinParam.name}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          name="email"
          value={joinParam.email}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          type="password"
          name="password"
          value={joinParam.password}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Join Type */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          가입 유형
        </label>
        <select
          name="joinType"
          value={joinParam.joinType}
          onChange={handleChange}
          className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
        >
          <option value="NEW_COMPANY">새 회사 생성</option>
          <option value="JOIN_COMPANY">기존 회사 가입</option>
        </select>
      </div>

      

      {/* Company Name */}
      {joinParam.joinType === "NEW_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            회사명
          </label>
          <input
            name="companyName"
            value={joinParam.companyName}
            onChange={handleChange}
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}




      {/* Company Select */}
      {joinParam.joinType === "JOIN_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            회사 선택
          </label>
          <select
            name="requestedCompanyId"
            value={joinParam.requestedCompanyId}
            onChange={handleChange}
            onFocus={fetchCompanies}
            className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200"
          >
            <option value="">-- 선택 --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

     {/* 사업자 등록 번호 입력 ---------------------------------*/}
     <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        사업자 등록 번호
      </label>
      <input
        type="text"
        name="businessNumber"
        value={joinParam.businessNumber}
        onChange={handleChange}
        placeholder="000-00-00000"
        maxLength={12}      // 하이픈 포함 최대 길이
        inputMode="numeric" // 모바일 숫자 패드 활성화
        className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all font-mono"
      />
      <p className="mt-1 text-[11px] text-gray-400">
        숫자만 입력하면 자동으로 형식이 지정됩니다.
      </p>
    </div>
      {/* 사업자 등록 번호 입력 ---------------------------------*/}

     {/* ------------------------------------------------------------------------------------------------ */}
      {/* 브랜드 등록 버튼 */}
      {joinParam.joinType === "NEW_COMPANY" && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            브랜드 등록 ({brands.length}개 등록됨)
          </label>
          <button
            type="button"
            onClick={handleOpenBrandModal}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            브랜드 등록하기
          </button>

          {/* BrandRegistrationModal 컴포넌트 사용 */}
          <BrandRegistrationModal
            show={showBrandModal}
            onClose={handleCloseBrandModal}
            onSave={handleSaveBrands}
            brands={brands}
            setBrands={setBrands}
          />
        </div>
      )}
       {/* ------------------------------------------------------------------------------------------------ */}
    



      

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        회원가입 요청
      </button>

      {/* Login 이동 */}
      <div className="mt-4 text-center">
        <button
          onClick={moveToLogin}
          className="text-sm text-blue-600 hover:underline"
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} InsightMarket
      </div>
    </div>
  );
};

export default JoinComponent;
