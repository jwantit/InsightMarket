import React, { useState, useEffect } from "react";

const AnalysisLoadingModal = ({ isOpen, radius }) => {
  const [steps, setSteps] = useState([
    { id: 1, text: `주변 ${radius}m 내 매장 검색 중...`, completed: false },
    { id: 2, text: "소상공인 유동인구 매칭 중...", completed: false },
    { id: 3, text: "매출 점수 산출 중...", completed: false },
  ]);

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫히면 상태 초기화
      setSteps((prev) =>
        prev.map((step) => ({ ...step, completed: false }))
      );
      return;
    }

    // 단계별 완료 시뮬레이션
    const timers = [
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 1 ? { ...step, completed: true, text: `주변 ${radius}m 내 매장 검색 완료` } : step
          )
        );
      }, 2000),
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 2 ? { ...step, completed: true, text: "소상공인 유동인구 매칭 완료" } : step
          )
        );
      }, 4000),
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 3 ? { ...step, completed: true, text: "매출 점수 산출 중..." } : step
          )
        );
      }, 6000),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [isOpen, radius]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">상권 분석 봇 (Beta)</h2>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-2xl">⋮</button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              🔄 데이터를 분석 중입니다...
            </div>
          </div>

          {/* 진행 단계 */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  step.completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <div
                  className={`text-sm flex-1 ${
                    step.completed ? "text-green-700 font-medium" : "text-gray-600"
                  }`}
                >
                  {step.text}
                </div>
              </div>
            ))}
          </div>

          {/* 애니메이션 아이콘 */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2 text-gray-400">
              <svg
                className="w-6 h-6 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-xs">분석 진행 중...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingModal;

