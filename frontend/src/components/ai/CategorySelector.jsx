import React from "react";

// 카테고리 옵션 (소매점 제외) - export하여 다른 컴포넌트에서도 사용 가능
export const categories = [
  { value: "cafe", label: "카페", groupName: "cafe" },
  { value: "restaurant", label: "음식점", groupName: "restaurant" },
  { value: "convenience", label: "편의점", groupName: "convenience" },
];

// 카테고리 그룹명 가져오기 헬퍼 함수
export const getCategoryGroupName = (categoryValue) => {
  const category = categories.find((cat) => cat.value === categoryValue);
  return category?.groupName || "cafe";
};

// 카테고리 라벨 가져오기 헬퍼 함수
export const getCategoryLabel = (categoryValue) => {
  const category = categories.find((cat) => cat.value === categoryValue);
  return category?.label || "카페";
};

const CategorySelector = ({ category, onCategoryChange }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-3">
        카테고리 선택 <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-3 py-2.5 rounded-xl border-2 font-semibold text-xs transition-all whitespace-nowrap ${
              category === cat.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
