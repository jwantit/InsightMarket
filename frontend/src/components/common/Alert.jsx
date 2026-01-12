import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from "lucide-react";

const Alert = ({ message, onConfirm, onCancel, type = "confirm", variant = "warning" }) => {
  const isAlertOnly = type === "alert" || !onCancel;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCancel) {
      onCancel();
    } else if (e.target === e.currentTarget && isAlertOnly) {
      onConfirm();
    }
  };

  // variant에 따른 스타일 설정
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-emerald-500 shadow-emerald-200",
          icon: CheckCircle,
          iconColor: "text-emerald-600",
          iconBgCircle: "bg-emerald-50",
          buttonBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
          title: "성공",
          subtitle: "작업이 완료되었습니다"
        };
      case "error":
        return {
          iconBg: "bg-red-500 shadow-red-200",
          icon: AlertCircle,
          iconColor: "text-red-600",
          iconBgCircle: "bg-red-50",
          buttonBg: "bg-red-600 hover:bg-red-700 shadow-red-200",
          title: "오류",
          subtitle: "오류가 발생했습니다"
        };
      case "info":
        return {
          iconBg: "bg-yellow-500 shadow-yellow-200",
          icon: Info,
          iconColor: "text-yellow-600",
          iconBgCircle: "bg-yellow-50",
          buttonBg: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200",
          title: "알림",
          subtitle: "알림 메시지입니다"
        };
      default: // warning
        return {
          iconBg: "bg-yellow-500 shadow-yellow-200",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          iconBgCircle: "bg-yellow-50",
          buttonBg: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200",
          title: isAlertOnly ? "알림" : "확인",
          subtitle: isAlertOnly ? "알림 메시지입니다" : "작업을 확인해주세요"
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${styles.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{styles.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {styles.subtitle}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="닫기"
              title="닫기"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 내용 */}
        <div className="px-6 py-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${styles.iconBgCircle} mb-4`}>
              <IconComponent size={32} className={styles.iconColor} />
            </div>
            <p className="text-base font-bold text-slate-900 mb-2">{message}</p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
            >
              취소
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl ${styles.buttonBg} text-white font-bold text-sm transition-all shadow-lg active:scale-95 ${
              !onCancel ? "w-full" : ""
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;

