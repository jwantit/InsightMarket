// src/components/dashboard/StatCard.jsx
import React from "react";

const StatCard = ({ label, value, icon: Icon, color, range, desc }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50",
    orange:
      "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/50",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    indigo:
      "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
  };

  return (
    <div className="group bg-white p-5 min-[601px]:p-6 rounded-[1.5rem] min-[601px]:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4 min-[601px]:mb-6">
          <span
            className={`px-2 py-0.5 min-[601px]:px-2.5 min-[601px]:py-1 ${colorMap[color]} text-[9px] min-[601px]:text-[10px] font-black rounded-lg border uppercase tracking-tighter`}
          >
            {label}
          </span>
          <div
            className={`p-2 min-[601px]:p-2.5 rounded-xl ${colorMap[color]} border shadow-inner`}
          >
            <Icon className="w-4 h-4 min-[601px]:w-5 min-[601px]:h-5" />
          </div>
        </div>

        <div>
          <p className="text-[10px] min-[601px]:text-[11px] text-slate-400 font-bold mb-1">{range}</p>
          <p className="text-xs min-[601px]:text-sm font-bold text-slate-600 mb-1 min-[601px]:mb-2">{desc}</p>
          <p className="text-xl min-[601px]:text-2xl md:text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
            {value}
          </p>
        </div>
      </div>

      {/* 배경 장식 원 */}
      <div className="absolute -bottom-6 -right-6 w-20 min-[601px]:w-24 h-20 min-[601px]:h-24 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors duration-500" />
    </div>
  );
};

export default StatCard;
