import React, { useState } from "react";
import { ChevronDown, Trash2, CheckCircle, Circle } from "lucide-react";

export default function CompetitorCard({
  competitor,
  index,
  onChange,
  onRemove,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const enabled = !!competitor?.enabled;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-300 ${
        enabled
          ? "border-slate-200 bg-white shadow-sm"
          : "border-slate-100 bg-slate-50/50 opacity-75"
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div
          className="flex items-center gap-4 flex-1 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
              enabled ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            {competitor.name
              ? competitor.name.slice(0, 1).toUpperCase()
              : index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                {competitor.name || `신규 경쟁사 #${index + 1}`}
              </h4>
              {enabled ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ ...competitor, enabled: !enabled })}
            className={`p-2 rounded-lg transition-colors ${
              enabled
                ? "text-emerald-500 hover:bg-emerald-50"
                : "text-slate-400 hover:bg-slate-100"
            }`}
            title={enabled ? "분석 제외" : "분석 포함"}
          >
            {enabled ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <button
            onClick={() => onRemove()}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-5 pt-2 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
              경쟁사 브랜드명
            </label>
            <input
              value={competitor.name}
              onChange={(e) =>
                onChange({ ...competitor, name: e.target.value })
              }
              className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              placeholder="예: 경쟁사 A"
            />
          </div>
        </div>
      )}
    </div>
  );
}
