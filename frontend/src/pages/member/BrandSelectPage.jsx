import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import useMyBrands from "../../hooks/useMyBrands";

const BrandSelectPage = () => {
  const navigate = useNavigate();
  const { brands, loading } = useMyBrands();
  const { doLogout } = useCustomLogin();

  if (loading) return null;

  // 브랜드 0개 → 브랜드 생성 or 로그아웃
  if (brands.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">접근 가능한 브랜드가 없습니다.</p>
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={doLogout}
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 브랜드 1개 → 자동 진입 (안전장치)
  if (brands.length === 1) {
    navigate(`/app/${brands[0].brandId}`, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-2">브랜드 선택</h1>
        <p className="text-sm text-gray-500 mb-6">
          작업할 브랜드를 선택하세요
        </p>

        <div className="grid grid-cols-1 gap-3">
          {brands.map((b) => (
            <button
              key={b.brandId}
              onClick={() =>
                navigate(`/app/${b.brandId}`, { replace: true })
              }
              className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <span className="font-medium text-gray-800">{b.name}</span>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSelectPage;
