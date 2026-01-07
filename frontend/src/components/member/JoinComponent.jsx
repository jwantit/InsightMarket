import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  Hash,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { joinMember } from "../../api/memberApi";
import { getCompanies } from "../../api/companyApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import { getErrorMessage } from "../../util/errorUtil";
import BrandRegistrationModal from "./showBrandModal";

const initState = {
  name: "",
  email: "",
  password: "",
  joinType: "NEW_COMPANY",
  companyName: "",
  businessNumber: "", //사업자번호
  requestedCompanyId: "",
  brands: [],
};

const JoinComponent = () => {
  const [joinParam, setJoinParam] = useState({ ...initState });
  const [companies, setCompanies] = useState([]);

  const { moveToLogin } = useCustomLogin();

  //브랜드 생성 부분--------------------------------------------------------
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brands, setBrands] = useState([
    {
      brandName: "",
      brandDescription: "",
      competitorName: "",
    },
  ]); //테스트

  useEffect(() => {
    console.log("brands", brands);
  }, [brands]);
  //브랜드 생성 부분--------------------------------------------------------

  //수정추가 포인트
  //------------------------------------------------------
  // // 모달 열기: 기존 데이터가 있으면 유지, 없으면 빈 값
  const handleOpenBrandModal = () => {
    setShowBrandModal(true);
  };
  //모달을 닫을시 브랜드 상태 초기화
  const handleCloseBrandModal = () => {
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
        formatted = `${onlyNums.slice(0, 3)}-${onlyNums.slice(
          3,
          5
        )}-${onlyNums.slice(5, 10)}`;
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
    const brand = brands[0];
    const hasValidBrand =
      brand && brand.brandName && brand.brandName.trim() !== "";

    if (joinParam.joinType === "NEW_COMPANY" && !hasValidBrand) {
      alert("브랜드를 등록해주세요.");
      return;
    }
    //브랜드 가공 --------------------------------------------------------

    const formattedBrands = hasValidBrand
      ? [
          {
            name: brand.brandName, // 브랜드 이름
            description: brand.brandDescription, // 브랜드 설명
            competitors: [
              {
                name: brand.competitorName, // 경쟁사 이름
              },
            ],
          },
        ]
      : [];

    //브랜드 폼
    const finalData = {
      ...joinParam,
      brands: formattedBrands, // 백엔드 DTO 필드명이 'brands' (List<BrandRequestDTO>)
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
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900">
            Insight<span className="text-blue-600">Market</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 font-medium">
            팀과 브랜드를 등록하고 시작하세요
          </p>
        </div>
      </div>

      {/* 폼 영역 */}
      <div className="p-8 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            이름
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User size={18} className="text-slate-400" />
            </div>
            <input
              name="name"
              value={joinParam.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            이메일
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail size={18} className="text-slate-400" />
            </div>
            <input
              type="email"
              name="email"
              value={joinParam.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            비밀번호
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock size={18} className="text-slate-400" />
            </div>
            <input
              type="password"
              name="password"
              value={joinParam.password}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Join Type */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            가입 유형
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Building2 size={18} className="text-slate-400" />
            </div>
            <select
              name="joinType"
              value={joinParam.joinType}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none"
            >
              <option value="NEW_COMPANY">새 회사 생성</option>
              <option value="JOIN_COMPANY">기존 회사 가입</option>
            </select>
          </div>
        </div>

        {/* Company Name */}
        {joinParam.joinType === "NEW_COMPANY" && (
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              회사명
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Building2 size={18} className="text-slate-400" />
              </div>
              <input
                name="companyName"
                value={joinParam.companyName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Company Select */}
        {joinParam.joinType === "JOIN_COMPANY" && (
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              회사 선택
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Building2 size={18} className="text-slate-400" />
              </div>
              <select
                name="requestedCompanyId"
                value={joinParam.requestedCompanyId}
                onChange={handleChange}
                onFocus={fetchCompanies}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="">-- 선택 --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 사업자 등록 번호 입력 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            사업자 등록 번호
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Hash size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="businessNumber"
              value={joinParam.businessNumber}
              onChange={handleChange}
              placeholder="000-00-00000"
              maxLength={12}
              inputMode="numeric"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium font-mono focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            숫자만 입력하면 자동으로 형식이 지정됩니다.
          </p>
        </div>

        {/* 브랜드 등록 버튼 */}
        {joinParam.joinType === "NEW_COMPANY" && (
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              브랜드 등록{" "}
            </label>
            <button
              type="button"
              onClick={handleOpenBrandModal}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Sparkles size={18} />
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

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus size={18} />
            회원가입 요청
          </button>
        </div>

        {/* Login 이동 */}
        <div className="pt-2 text-center">
          <button
            onClick={moveToLogin}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            이미 계정이 있으신가요? <span className="font-bold">로그인</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-6 pt-2 text-center">
        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} InsightMarket
        </div>
      </div>
    </div>
  );
};

export default JoinComponent;
