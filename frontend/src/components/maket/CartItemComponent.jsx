import React from "react";
import { Trash2 } from "lucide-react";

const CartItemComponent = ({ item, onRemove, onToggle, isChecked, isFirst }) => {
  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-blue-50/30 group ${
        isFirst ? "" : "border-t border-slate-100"
      }`}
    >
      <div className="w-8 flex-shrink-0">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(item.solutionid)}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
        />
      </div>

      <span className="text-slate-500 w-16 flex-shrink-0 font-medium">
        {item.solutionid}
      </span>

      <div className="flex-1 min-w-0">
        <span className="font-bold text-slate-900 truncate block group-hover:text-blue-600 transition-colors">
          {item.solutiontitle}
        </span>
        {item.strategyTitle && (
          <span className="text-xs text-slate-400 mt-0.5 block">
            {item.strategyTitle}
          </span>
        )}
      </div>

      <span className="text-right font-bold text-slate-900 w-32 flex-shrink-0">
        {item.solutionprice?.toLocaleString()}원
      </span>

      <div className="flex-shrink-0">
        <button
          onClick={() => onRemove([item.cartitemid])}
          className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-200 active:scale-95"
          title="삭제"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItemComponent;