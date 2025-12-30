import { useEffect, useState } from "react";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponentA from "./PageComponentA";
import { findMember } from "../../api/paymentApi";
import PurchaseFetchingModal from "./PurchaseFetchingModal";


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


const PurchaseComponent = ({params}) => {
    const gradients = [
      "from-blue-500 to-emerald-400",
      "from-purple-500 to-pink-500",
      "from-orange-400 to-rose-500",
    ];

    const { page, size, refresh, moveToList } = useCustomMove();
    const [serverData, setServerData] = useState(initState);
    const [selectedOrder, setSelectedOrder] = useState(null); //모달용상태추가

    const fromDate = params.get("from") || "";
    const toDate = params.get("to") || "";
    const sort = params.get("sort") || "latest";

    useEffect(() => {
        const pageRequest = {
          page,
          size,
          sort,
          from: fromDate || null,
          to: toDate || null,
        };
      
        findMember(pageRequest).then(data => {
          setServerData(data);
          console.log("" , data)
        });
      
      }, [page, size, sort, fromDate, toDate, refresh]);

  
    return (
      <div className="space-y-4">
        {serverData.dtoList.map((OrderHistoryDTO, idx) => (
          <div key={OrderHistoryDTO.orderId} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition">
            
            <div className={`w-24 h-24 rounded-2xl flex-shrink-0 relative overflow-hidden bg-gradient-to-br ${gradients[idx % gradients.length]}`}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-[11px] opacity-90 uppercase text-center break-words px-1">
              Insight Market
              </div>
            </div>
  
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase">{OrderHistoryDTO.buyerName}</span>
                <span className="text-xs text-gray-400 border-l pl-2">구매일자:{OrderHistoryDTO.createdAt}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{OrderHistoryDTO.orderTitle}</h2>
              <p className="text-sm text-gray-500">주문번호:{OrderHistoryDTO.merchantUid}</p>
            </div>
  
            <div className="text-right space-y-2">
              <p className="text-lg font-black text-gray-900">결제금액 {OrderHistoryDTO.totalPrice?.toLocaleString()}원 </p>
              <button 
              onClick={() => setSelectedOrder(OrderHistoryDTO)}
              className="bg-blue-600 text-white border border-blue-600 px-5 py-2 text-xs font-bold rounded-xl hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-all duration-300 shadow-md active:scale-95">
               상세내역
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
  