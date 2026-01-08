// src/components/ai/AnalysisLoadingModal.jsx
import React, { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  Search,
  Database,
  Calculator,
} from "lucide-react";

const AnalysisLoadingModal = ({ isOpen, radius }) => {
  const steps = [
    { id: 1, text: `반경 ${radius}m 반경 내 잠재 매장 검색`, icon: Search },
    { id: 2, text: "소상공인 유동인구 빅데이터 매칭", icon: Database },
    { id: 3, text: "AI 알고리즘 기반 매출 점수 산출", icon: Calculator },
  ];

  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(1);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-blue-600 animate-pulse">
              <Database size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Market Analysis
          </h2>
          <p className="text-sm font-medium text-slate-400 mb-8">
            AI가 상권 데이터를 정밀하게 스캔하고 있습니다.
          </p>

          <div className="w-full space-y-3">
            {steps.map((step) => {
              const isCompleted = activeStep > step.id;
              const isActive = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-50 border-emerald-100 opacity-60"
                      : isActive
                      ? "bg-white border-blue-200 shadow-xl shadow-blue-50"
                      : "bg-slate-50 border-slate-100 opacity-40"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${
                      isCompleted
                        ? "text-emerald-500"
                        : isActive
                        ? "text-blue-600"
                        : "text-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <step.icon
                        size={18}
                        className={isActive ? "animate-bounce" : ""}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isCompleted
                        ? "text-emerald-700 line-through"
                        : isActive
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingModal;
