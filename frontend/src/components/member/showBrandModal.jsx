// src/components/member/showBrandModal.jsx
import React from "react";

const BrandRegistrationModal = ({ show, onClose, onSave, brands = [], setBrands }) => {

  if (!show) return null;

  const handleBrandFieldChange = (index, e) => {
    const newBrands = [...brands];
    newBrands[index][e.target.name] = e.target.value;
    setBrands(newBrands);
  };

  // 유효성 검사: 필수 필드 확인
  const isAnyNameEmpty = brands.some(brand => !brand.brandName || brand.brandName.trim() === "");
  const isAnyCompetitorNameEmpty = brands.some(brand => !brand.competitorName || brand.competitorName.trim() === "");
  const isAnyCompetitorKeywordsEmpty = brands.some(brand => !brand.competitorKeywords || brand.competitorKeywords.trim() === "");
  const isAnyFieldEmpty = isAnyNameEmpty || isAnyCompetitorNameEmpty || isAnyCompetitorKeywordsEmpty;

  const addBrandField = () => {
    if (isAnyFieldEmpty) return;
    const filledBrands = brands.filter(brand => 
      brand.brandName.trim() !== '' && 
      brand.competitorName.trim() !== '' && 
      brand.competitorKeywords.trim() !== ''
    );
    setBrands([...filledBrands, { brandName: "", brandDescription: "", competitorName: "", competitorKeywords: "" }]);
  };

  const removeBrandField = (index) => {
    const newBrands = brands.filter((_, i) => i !== index);
    setBrands(newBrands);
  };

  const handleSaveClick = () => {
    // 필수 필드가 모두 입력된 브랜드만 필터링하여 부모에게 전달
    const brandsToSave = brands.filter(brand => 
      brand.brandName.trim() !== '' && 
      brand.competitorName.trim() !== '' && 
      brand.competitorKeywords.trim() !== ''
    );
    onSave(brandsToSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">브랜드 등록</h2>

        <div className="space-y-4 mb-6">
          {brands.map((brand, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  브랜드명 ({index + 1}) <span className="text-red-500">*필수</span>
                </label>
                <input
                  name="brandName"
                  value={brand.brandName || ""}
                  onChange={(e) => handleBrandFieldChange(index, e)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="브랜드명"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  브랜드 설명 ({index + 1})
                </label>
                <textarea
                  name="brandDescription"
                  value={brand.brandDescription || ""}
                  onChange={(e) => handleBrandFieldChange(index, e)}
                  rows="2"
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="브랜드 설명"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  경쟁사 이름 ({index + 1}) <span className="text-red-500">*필수</span>
                </label>
                <input
                  name="competitorName"
                  value={brand.competitorName || ""}
                  onChange={(e) => handleBrandFieldChange(index, e)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="경쟁사 이름"
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  경쟁사 키워드 ({index + 1}) <span className="text-red-500">*필수</span>
                </label>
                <input
                  name="competitorKeywords"
                  value={brand.competitorKeywords || ""}
                  onChange={(e) => handleBrandFieldChange(index, e)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="경쟁사 키워드"
                />
              </div>
              {brands.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBrandField(index)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  삭제하기
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addBrandField}
          disabled={isAnyFieldEmpty}
          className={`w-full py-2.5 rounded-lg border-2 border-dashed text-sm font-bold transition ${
            isAnyFieldEmpty 
              ? "border-gray-200 text-gray-300 cursor-not-allowed" 
              : "border-blue-400 text-blue-500 hover:bg-blue-50"
          }`}
        >
          + 브랜드 추가
        </button>

        <div className="mt-8 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 rounded-lg text-gray-600 font-semibold hover:bg-gray-200"
          >
            취-소
          </button>
          <button
            onClick={handleSaveClick}
            className="flex-1 py-2.5 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandRegistrationModal;