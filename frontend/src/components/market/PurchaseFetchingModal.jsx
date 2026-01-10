import { useNavigate } from "react-router-dom";
import { useBrand } from "../../hooks/brand/useBrand";

const PurchaseFetchingModal = ({ order, onClose }) => {
  const navigate = useNavigate();
  const { brandId } = useBrand();

  if (!order) return null;

  const handleViewReport = (solutionId) => {
    navigate(`/app/${brandId}/market/reports/${solutionId}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1055] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white shadow-2xl rounded-3xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 고정 */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            주문 상세 정보
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-200"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* 내용 영역: 상품이 많으면 여기서 스크롤 발생 */}
        <div className="p-8 lg:p-10 space-y-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {/* 결제 상태 카드 */}
          <div className="flex items-center p-6 bg-blue-50 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-blue-600 font-black uppercase text-sm tracking-widest">
                  결제상태
                </p>
                <p className="text-gray-500 font-medium">
                  {order.createdAt} 결제 완료
                </p>
              </div>
            </div>
          </div>

          {/* 상세 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                구매한 Solution
              </label>
              <p className="text-2xl font-bold text-gray-900 mt-2 leading-tight">
                {order.orderTitle}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                주문번호
              </label>
              <p className="text-base font-bold text-gray-700">
                {order.merchantUid}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                구매자명
              </label>
              <p className="text-base font-bold text-gray-700">
                {order.buyerName}
              </p>
            </div>

            {/* 상세 구매 리스트 */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                상세 구매 내역
              </label>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                {order.orderItems?.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 flex justify-between items-center ${
                      index !== order.orderItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-gray-900">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-bold">
                          Project | {item.projectname}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {item.strategytitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-gray-900">
                        {item.price?.toLocaleString()}원
                      </p>
                      {item.solutionid && (
                        <button
                          onClick={() => handleViewReport(item.solutionid)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          리포트 보기
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.receiptUrl && (
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  전자 영수증 미리보기
                </label>
                <div className="relative w-full h-64 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  <iframe
                    src={order.receiptUrl}
                    className="w-full h-full border-0"
                    title="영수증"
                  />
                  <div className="absolute bottom-2 right-2">
                    <a
                      href={order.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm border border-gray-200"
                    >
                      새창에서 크게보기 ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
            {/* 최종 금액 - 내용 영역 하단에 위치 */}
            <div className="md:col-span-2 pt-8 border-t border-gray-100 mt-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  최종 결제 금액
                </label>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">
                  {order.totalPrice?.toLocaleString()}
                  <span className="text-lg ml-1 font-bold">원</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼: 고정 */}
        <div className="bg-white border-t border-gray-50 px-8 py-6 flex justify-center flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 font-bold transition-all duration-300 shadow-xl active:scale-95"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFetchingModal;
