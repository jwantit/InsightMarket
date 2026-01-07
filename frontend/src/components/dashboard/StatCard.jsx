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
    <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-6">
          <span
            className={`px-2.5 py-1 ${colorMap[color]} text-[10px] font-black rounded-lg border uppercase tracking-tighter`}
          >
            {label}
          </span>
          <div
            className={`p-2.5 rounded-xl ${colorMap[color]} border shadow-inner`}
          >
            <Icon size={18} />
          </div>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 font-bold mb-1">{range}</p>
          <p className="text-sm font-bold text-slate-600 mb-2">{desc}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            {value}
          </p>
        </div>
      </div>

      {/* 배경 장식 원 */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:bg-blue-50 transition-colors duration-500" />
    </div>
  );
};

export default StatCard;
