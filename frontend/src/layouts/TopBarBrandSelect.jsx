import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Building2, Plus } from "lucide-react";
import useMyBrands from "../hooks/brand/useMyBrands";
import { useBrand } from "../hooks/brand/useBrand";
import { useBrandNavigate } from "../hooks/brand/useBrandNavigate";

const TopBarBrandSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { brands, loading } = useMyBrands();
  const { brandId } = useBrand();
  const { changeBrandKeepPath } = useBrandNavigate();
  const dropdownRef = useRef(null);

  // 현재 선택된 브랜드 정보 찾기
  const currentBrand = brands?.find((b) => b.brandId === brandId);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !brands)
    return <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-lg" />;

  const handleBrandSelect = (nextBrandId) => {
    if (nextBrandId === brandId) {
      setIsOpen(false);
      return;
    }
    changeBrandKeepPath(nextBrandId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200
          ${
            isOpen
              ? "bg-blue-50 border-blue-200 ring-4 ring-blue-50/50"
              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Building2 size={14} />
        </div>

        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Brand
          </span>
          <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate">
            {currentBrand?.name || "브랜드 선택"}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
          <div className="p-3 bg-slate-50/50 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase">
              내 브랜드 목록
            </p>
          </div>

          <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {brands.map((brand) => {
              const isActive = brand.brandId === brandId;
              return (
                <button
                  key={brand.brandId}
                  onClick={() => handleBrandSelect(brand.brandId)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                    >
                      {brand.name.slice(0, 1)}
                    </div>
                    <span className="text-sm font-semibold truncate">
                      {brand.name}
                    </span>
                  </div>

                  {isActive && (
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBarBrandSelect;

