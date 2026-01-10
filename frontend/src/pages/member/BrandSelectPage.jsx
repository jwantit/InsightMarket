import { useNavigate } from "react-router-dom";
import { Building2, LogOut, ChevronRight, Loader2 } from "lucide-react";
import useCustomLogin from "../../hooks/login/useCustomLogin";
import useMyBrands from "../../hooks/brand/useMyBrands";

const BrandSelectPage = () => {
  const navigate = useNavigate();
  const { brands, loading } = useMyBrands();
  const { doLogout, moveToLogin } = useCustomLogin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-600 font-medium">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 브랜드 0개 → 브랜드 생성 or 로그아웃
  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
              <Building2 size={32} className="text-red-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-900 mb-2">
                접근 가능한 브랜드가 없습니다
              </h2>
              <p className="text-sm text-slate-500">
                관리자에게 브랜드 접근 권한을 요청하세요
              </p>
            </div>
            <button
              onClick={() => {
                doLogout();
                alert("로그아웃되었습니다.");
                moveToLogin();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 브랜드 1개 → 자동 진입 (안전장치)
  if (brands.length === 1) {
    navigate(`/app/${brands[0].brandId}/dashboard`, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                브랜드 선택
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                작업할 브랜드를 선택하세요
              </p>
            </div>
          </div>
        </div>

        {/* 브랜드 목록 */}
        <div className="p-6 space-y-3">
          {brands.map((b) => (
            <button
              key={b.brandId}
              onClick={() =>
                navigate(`/app/${b.brandId}/dashboard`, { replace: true })
              }
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-blue-300 transition-colors">
                  <Building2
                    size={18}
                    className="text-slate-600 group-hover:text-blue-600 transition-colors"
                  />
                </div>
                <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  {b.name}
                </span>
              </div>
              <ChevronRight
                size={20}
                className="text-slate-400 group-hover:text-blue-600 transition-colors"
              />
            </button>
          ))}
        </div>

        {/* 푸터 */}
        <div className="px-8 pb-6 pt-2">
          <button
            onClick={() => {
              doLogout();
              alert("로그아웃되었습니다.");
              moveToLogin();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandSelectPage;
