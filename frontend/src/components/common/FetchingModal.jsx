import { X, ShoppingCart, Trash2, Package, Calendar, Tag, DollarSign, Image as ImageIcon } from "lucide-react";

const FetchingModal = ({ solution, onClose, onPurchase, onDelete }) => {
  if (!solution) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">AI Solution 상세</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                솔루션 정보를 확인하고 구매하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="닫기"
            title="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
          {/* 이미지 */}
          {solution.imageurl && (
            <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                  <ImageIcon size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">솔루션 이미지</h3>
              </div>
              <div className="p-6 flex justify-center bg-slate-50">
                <img
                  src={solution.imageurl}
                  alt={solution.title}
                  className="w-full max-w-md h-64 object-cover rounded-2xl shadow-md"
                />
              </div>
            </div>
          )}

          {/* 기본 정보 */}
          <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:text-blue-600 transition-colors">
                <Package size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">기본 정보</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  솔루션의 상세 정보입니다.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Tag size={14} />
                  Solution
                </label>
                <p className="text-lg font-bold text-slate-900">{solution.title}</p>
              </div>

              {solution.projectname && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={14} />
                    프로젝트
                  </label>
                  <p className="text-sm font-medium text-slate-700">{solution.projectname}</p>
                </div>
              )}

              {solution.strategytitle && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={14} />
                    전략
                  </label>
                  <p className="text-sm font-medium text-slate-700">{solution.strategytitle}</p>
                </div>
              )}

              {solution.createdAt && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} />
                    생성일
                  </label>
                  <p className="text-sm font-medium text-slate-700">{solution.createdAt}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={14} />
                  가격
                </label>
                <p className="text-2xl font-black text-blue-600">
                  {solution.price?.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95"
              >
                <Trash2 size={18} />
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              닫기
            </button>
            {onPurchase && (
              <button
                onClick={onPurchase}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
              >
                <ShoppingCart size={18} />
                구매하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchingModal;

