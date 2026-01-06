import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponentA from "./PageComponentA";
import { findMember } from "../../api/paymentApi";
import PurchaseFetchingModal from "./PurchaseFetchingModal";
import { useBrand } from "../../hooks/useBrand";

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totoalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const PurchaseComponent = ({ params }) => {
  const gradients = [
    "from-blue-500 to-emerald-400",
    "from-purple-500 to-pink-500",
    "from-orange-400 to-rose-500",
  ];

  const navigate = useNavigate();
  const { brandId } = useBrand();
  const { page, size, refresh, moveToList } = useCustomMove();
  const [serverData, setServerData] = useState(initState);
  const [selectedOrder, setSelectedOrder] = useState(null); //모달용상태추가

  const fromDate = params.get("from") || "";
  const toDate = params.get("to") || "";
  const sort = params.get("sort") || "latest";

  // 카드 클릭 시 첫 번째 리포트 상세로 이동
  const handleCardClick = (order) => {
    if (
      order.orderItems &&
      order.orderItems.length > 0 &&
      order.orderItems[0].solutionid
    ) {
      navigate(
        `/app/${brandId}/market/reports/${order.orderItems[0].solutionid}`
      );
    }
  };

  // 상세내역 버튼 클릭 시 모달 열기 (이벤트 전파 방지)
  const handleDetailClick = (e, order) => {
    e.stopPropagation();
    setSelectedOrder(order);
  };

  useEffect(() => {
    const pageRequest = {
      page,
      size,
      sort,
      from: fromDate || null,
      to: toDate || null,
    };

    findMember(pageRequest).then((data) => {
      setServerData(data);
      console.log("", data);
    });
  }, [page, size, sort, fromDate, toDate, refresh]);

  if (serverData.dtoList.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-600 mb-1">
              구매 내역이 없습니다.
            </p>
            <p className="text-xs text-slate-400">
              구매한 솔루션이 있으면 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {serverData.dtoList.map((OrderHistoryDTO, idx) => (
        <div
          key={OrderHistoryDTO.orderId}
          onClick={() => handleCardClick(OrderHistoryDTO)}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div
            className={`w-20 h-20 rounded-2xl flex-shrink-0 relative overflow-hidden bg-gradient-to-br ${
              gradients[idx % gradients.length]
            }`}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/20 rounded-full blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[10px] opacity-90 uppercase text-center break-words px-1">
              Insight Market
            </div>
          </div>

          <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-full uppercase font-bold">
                {OrderHistoryDTO.buyerName}
              </span>
              <span className="text-xs text-slate-400 border-l border-slate-200 pl-2">
                구매일자: {OrderHistoryDTO.createdAt}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {OrderHistoryDTO.orderTitle}
            </h2>
            <p className="text-sm text-slate-500">
              주문번호: {OrderHistoryDTO.merchantUid}
            </p>
          </div>

          <div className="text-right space-y-3 flex-shrink-0">
            <p className="text-xl font-black text-slate-900">
              {OrderHistoryDTO.totalPrice?.toLocaleString()}원
            </p>
            <button
              onClick={(e) => handleDetailClick(e, OrderHistoryDTO)}
              className="bg-blue-600 text-white px-5 py-2.5 text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
            >
              주문 상세
            </button>
          </div>
        </div>
      ))}

      {/* 모달렌더링 */}
      {selectedOrder && (
        <PurchaseFetchingModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {serverData.dtoList.length > 0 && (
        <PageComponentA serverData={serverData} movePage={moveToList} />
      )}
    </div>
  );
};

export default PurchaseComponent;
