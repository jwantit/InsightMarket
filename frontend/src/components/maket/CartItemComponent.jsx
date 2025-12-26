import React from "react"; // React 임포트

const CartItemComponent = ({ item, onRemove, onToggle, isChecked }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-t text-sm">
      <div className="w-8 flex-shrink-0">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(item.cartItemid)} // 체크박스 변경 시 onToggle 호출
          className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
      </div>
      
      <span className="text-gray-500 w-16 flex-shrink-0">{item.solutionid}</span>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-bold text-gray-800 truncate">{item.solutiontitle}</span>
      </div>

     <div>
      <span className="text-gray-500 w-16 flex-shrink-0">{item.strategyTitle}</span>
    </div>

      <span className="text-right font-semibold text-gray-900 w-24 flex-shrink-0">
        {item.solutionprice?.toLocaleString()}원
      </span>

      <div className="flex-shrink-0">
        <button
          onClick={() => onRemove(item.cartitemid)}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          title="삭제"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItemComponent;
