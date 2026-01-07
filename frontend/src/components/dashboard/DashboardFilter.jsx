// src/components/dashboard/DashboardFilter.jsx
import React from "react";

const DashboardFilter = ({ appliedChannels, handleToggle }) => {
  return (
    <div className="flex items-center bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm gap-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5 border-r border-slate-100 pr-4 mr-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Filter
          </span>
        </div>

        {/* 네이버 토글 */}
        <div className="flex items-center gap-2.5">
          <span
            className={`text-[11px] font-black transition-colors ${
              appliedChannels.includes("NAVER")
                ? "text-emerald-500"
                : "text-slate-400"
            }`}
          >
            NAVER
          </span>
          <button
            onClick={() => handleToggle("NAVER")}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
              appliedChannels.includes("NAVER")
                ? "bg-blue-500 shadow-inner"
                : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                appliedChannels.includes("NAVER")
                  ? "translate-x-4.5"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* 유튜브 토글 */}
        <div className="flex items-center gap-2.5 border-l border-slate-100 pl-5">
          <span
            className={`text-[11px] font-black transition-colors ${
              appliedChannels.includes("YOUTUBE")
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            YOUTUBE
          </span>
          <button
            onClick={() => handleToggle("YOUTUBE")}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
              appliedChannels.includes("YOUTUBE")
                ? "bg-blue-500 shadow-inner"
                : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                appliedChannels.includes("YOUTUBE")
                  ? "translate-x-4.5"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilter;
