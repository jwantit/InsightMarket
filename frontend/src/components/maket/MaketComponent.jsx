import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLatestStrategyByProject,
  getAllSolutionByProject,
  removeSolution,
} from "../../api/solutionApi";
import PageComponentA from "./PageComponentA";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import useCustomCart from "../../hooks/useCustomCart"; // useCustomCart 임포트
import usePayment from "../../hooks/common/payment/useCustomPayment";
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
//MaketLsit에서 전달받은 projectid = n , filter = ALL 또는 RECENT
const MaketComponent = ({ projectId, filter }) => {
  const { page, size, refresh, moveToList } = useCustomMove(projectId, filter);
  const [serverData, setServerData] = useState(initState);
  const [loading, setLoading] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const { addCartItem, cartState, refreshCart } = useCustomCart(projectId); // useCustomCart 훅 사용

  const { handlePayment } = usePayment();
  const navigate = useNavigate();
  const { brandId } = useBrand();

  const { items } = cartState;

  useEffect(() => {
    if (projectId) {
      refreshCart(); // projectId가 유효할 때만 refreshCart 호출
    }
  }, [projectId]); // refreshCart 함수가 useCallback으로 감싸져 있으므로 안전합니다.

  useEffect(() => {
    if (!projectId) return; //props 해온 projectid가 없다면 return

    setLoading(true);

    if (filter === "ALL") {
      //filter가 ALL이면
      // NEW전략: getLatestStrategyByProject 사용 (배열 데이터) -> 백엔드
      getLatestStrategyByProject(projectId)
        .then((data) => {
          // 백엔드에서 배열로 반환되는 솔루션 리스트를 그대로 사용

          console.log("NEW전략 목록:", data);

          const solutionList = Array.isArray(data) ? data : [];
          setServerData({
            //state 반영
            ...initState,
            dtoList: solutionList,
            strategyName: solutionList[0]?.strategytitle || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("NEW전략 조회 실패", err);
          setServerData(initState);
          setLoading(false);
        });
    } else {
      // 전체보기: getAllSolutionByProject 사용 (페이지네이션)
      getAllSolutionByProject(page, size, projectId)
        .then((data) => {
          console.log("전체보기:", data);

          setServerData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("전체보기 조회 실패", err);
          setServerData(initState);
          setLoading(false);
        });
    }
  }, [projectId, filter, page, size, refresh]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* 로딩 상태 */}
      {loading && (
        <div className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse" />
            <p className="text-sm text-slate-500">로딩 중...</p>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && serverData.dtoList.length === 0 && (
        <div className="p-12 text-center">
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
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 mb-1">
                등록된 상품이 없습니다.
              </p>
              <p className="text-xs text-slate-400">
                새로운 솔루션이 등록되면 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 전략명 표시 (NEW전략일 때만) */}
      {filter === "ALL" && serverData.strategyName && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full">
              NEW 전략
            </span>
            <span className="text-sm font-bold text-slate-900">
              {serverData.strategyName}
            </span>
          </div>
        </div>
      )}

      {/* 상품 리스트 */}
      {!loading &&
        serverData.dtoList.map((solution, idx) => (
          <div
            key={solution.solutionid}
            className={`flex items-center gap-4 px-6 py-4 text-sm transition-colors ${
              idx === 0 && filter !== "ALL" ? "" : "border-t border-slate-100"
            } hover:bg-blue-50/30 group`}
          >
            {/* 번호 */}
            <span className="text-slate-500 w-16 flex-shrink-0 font-medium">
              {solution.solutionid}
            </span>

            {/* 상품명 */}
            <span className="font-bold text-slate-900 flex-1 min-w-0 truncate group-hover:text-blue-600 transition-colors">
              {solution.title}
            </span>

            {/* 가격 */}
            <span className="font-bold text-slate-900 w-32 text-right flex-shrink-0">
              {solution.price?.toLocaleString()}원
            </span>

            {/* 버튼 영역 */}
            <div className="flex gap-2 justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedSolution(solution)}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
                title="상세보기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button
                onClick={async () => {
                  const isExist = items.some(
                    (item) => item.solutionid === solution.solutionid
                  );
                  if (isExist) {
                    alert("이미 장바구니에 담긴 상품입니다.");
                    return;
                  }

                  try {
                    await addCartItem({
                      projectid: projectId,
                      solutionid: solution.solutionid,
                    });
                    alert("장바구니에 추가되었습니다.");
                  } catch (error) {
                    console.error("장바구니 추가 실패", error);
                    alert("장바구니 추가에 실패했습니다.");
                  }
                }}
                className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all shadow-md shadow-slate-200 active:scale-95"
                title="장바구니"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

      {/* 페이지네이션 (전체보기일 때만 표시) */}
      {!loading && filter === "RECENT" && serverData.dtoList.length > 0 && (
        <PageComponentA serverData={serverData} movePage={moveToList} />
      )}

      {/* 상세보기 모달 */}
      {selectedSolution && (
        <FetchingModal
          solution={selectedSolution}
          onClose={() => setSelectedSolution(null)}
          onPurchase={async () => {
            if (!selectedSolution) return;
            console.log("구매하기:", selectedSolution);

            try {
              const isSuccess = await handlePayment(projectId, [
                selectedSolution,
              ]);
              if (isSuccess) {
                setSelectedSolution(null);
                navigate(0);
              }
            } catch (error) {
              console.error("단일 구매 중 에러:", error);
            }
          }}
          onDelete={async () => {
            if (window.confirm("솔루션을 정말 삭제하시겠습니까?")) {
              try {
                await removeSolution(selectedSolution.solutionid);
                alert(
                  "삭제되었습니다. 전략추천에서 다시 생성하실 수 있습니다."
                );
                setSelectedSolution(null);
                // 목록 새로고침을 위해 refresh 트리거
                window.location.reload();
              } catch (err) {
                console.error("삭제 실패", err);
                alert("삭제에 실패했습니다.");
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default MaketComponent;
