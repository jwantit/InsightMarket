import { CheckCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

const ResultModal = ({ title, content, callbackFn }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && callbackFn) {
      callbackFn();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CheckCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                작업이 완료되었습니다
              </p>
            </div>
          </div>

          <button
            onClick={callbackFn}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="닫기"
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-2">{content}</p>
            <p className="text-sm text-slate-500">
              변경사항이 성공적으로 저장되었습니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={callbackFn}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResultModal;
