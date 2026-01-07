// src/components/common/PageHeader.jsx
import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";

const PageHeader = ({
  icon: Icon,
  title,
  subtitle,
  breadcrumb,
  badge,
  extra,
  isAi = false,
}) => {
  return (
    <div className="relative mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* 1. 상단 브레드크럼 */}
      <nav className="flex items-center gap-2 mb-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
        <span className="hover:text-slate-600 cursor-pointer transition-colors">
          InsightMarket
        </span>
        {breadcrumb && (
          <>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-blue-600/80">{breadcrumb}</span>
          </>
        )}
      </nav>

      {/* 2. 메인 헤더 본체 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          {/* 아이콘 컨테이너 */}
          <div
            className={`
            w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300
            ${
              isAi
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-blue-200 shadow-blue-100"
                : "bg-white text-blue-600 border-slate-200 shadow-slate-100"
            }
          `}
          >
            {Icon && <Icon size={28} strokeWidth={2.5} />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {title}
              </h1>
              {badge && (
                <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">
                  {badge}
                </span>
              )}
              {isAi && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 uppercase animate-pulse">
                  <Sparkles size={10} /> AI Agent Active
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 3. 우측 액션 영역 */}
        {extra && <div className="flex items-center gap-3">{extra}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
