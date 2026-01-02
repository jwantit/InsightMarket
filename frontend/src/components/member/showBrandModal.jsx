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
  const isAnyFieldEmpty = !brands[0]?.brandName || brands[0]?.brandName.trim() === "";

  const handleSaveClick = () => {
    // 필수 필드가 입력되었는지 확인 후 부모에게 전달
    if (brands[0]?.brandName?.trim() !== '') {
      onSave(brands);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">브랜드 등록</h2>

        <div className="space-y-4 mb-6">
          {brands[0] && (
            <div className="p-4 border rounded-lg bg-gray-50 relative">
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  브랜드명 
                </label>
                <input
                  name="brandName"
                  value={brands[0].brandName || ""}
                  onChange={(e) => handleBrandFieldChange(0, e)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="브랜드 입력"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  브랜드 설명 
                </label>
                <textarea
                  name="brandDescription"
                  value={brands[0].brandDescription || ""}
                  onChange={(e) => handleBrandFieldChange(0, e)}
                  rows="2"
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="브랜드 설명"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  경쟁사
                </label>
                <input
                  name="competitorName"
                  value={brands[0].competitorName || ""}
                  onChange={(e) => handleBrandFieldChange(0, e)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="경쟁사 입력"
                />
              </div>
            </div>
          )}
        </div>

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