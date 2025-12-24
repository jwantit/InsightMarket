import { Link } from "react-router-dom";
import { getKakaoLoginLink } from "../../api/kakaoApi";

const KakaoLoginComponent = () => {
  const link = getKakaoLoginLink();

  return (
    <div className="flex flex-col gap-3">
      <Link
        to={link}
        className="flex items-center justify-center gap-3 w-full rounded-lg border bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-[#191600] hover:brightness-95 transition"
      >
        {/* Kakao Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 5.58 2 10.07c0 2.92 1.97 5.48 4.93 6.87-.21.73-.76 2.64-.87 3.05-.14.55.2.54.43.39.18-.12 2.86-1.89 4.04-2.68.53.08 1.08.12 1.64.12 5.523 0 10-3.58 10-8.07C22 5.58 17.523 2 12 2z" />
        </svg>

        <span>카카오로 계속하기</span>
      </Link>

      <p className="text-center text-xs text-gray-400">
        로그인 시 자동으로 회원가입이 진행됩니다.
      </p>
    </div>
  );
};

export default KakaoLoginComponent;
