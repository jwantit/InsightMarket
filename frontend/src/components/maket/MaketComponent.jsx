import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getLatestStrategyByProject, getAllSolutionByProject, removeSolution } from "../../api/solutionApi";
import PageComponentA from "./PageComponentA";
import useCustomMove from "../../hooks/useCustomMove";
import FetchingModal from "../common/FetchingModal";
import useCustomCart from "../../hooks/useCustomCart"; // useCustomCart 임포트

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
  const { addCartItem, cartState , refreshCart} = useCustomCart(projectId); // useCustomCart 훅 사용


  const {items} = cartState;

  useEffect(() => {
    if (projectId) {
      refreshCart(); // projectId가 유효할 때만 refreshCart 호출
    }
  }, [projectId]); // refreshCart 함수가 useCallback으로 감싸져 있으므로 안전합니다.

  useEffect(() => {
    if (!projectId) return; //props 해온 projectid가 없다면 return

    setLoading(true);

    if (filter === "ALL") { //filter가 ALL이면 
      // NEW전략: getLatestStrategyByProject 사용 (배열 데이터) -> 백엔드
      getLatestStrategyByProject(projectId)
        .then((data) => {
          // 백엔드에서 배열로 반환되는 솔루션 리스트를 그대로 사용

          console.log("NEW전략 목록:", data);

          const solutionList = Array.isArray(data) ? data : [];
          setServerData({ //state 반영
            ...initState,
            dtoList: solutionList,
            strategyName: solutionList[0]?.strategytitle || ""
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
    <div className="border rounded-lg overflow-hidden">
      {/* 로딩 상태 */}
      {loading && (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">
          로딩 중...
        </div>
      )}

      {/* 리스트 */}
      {!loading && serverData.dtoList.length === 0 && (
        <div className="px-4 py-6 text-center text-gray-400 text-sm">
          등록된 상품이 없습니다.
        </div>
      )}

      {/* 전략명 표시 (NEW전략일 때만) */}
      {filter === "ALL" && serverData.strategyName && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
              NEW 전략
            </span>
            <span className="text-sm font-bold text-gray-800">
              {serverData.strategyName}
            </span>
          </div>
        </div>
      )}

      {!loading &&
        serverData.dtoList.map((solution) => (
          <div
            key={solution.solutionid}
            className="flex items-center gap-4 px-4 py-3 border-t text-sm hover:bg-gray-50"
          >
            {/* No */}
            <span className="text-gray-500 w-16 flex-shrink-0">{solution.solutionid}</span>

            {/* 상품명 - flex-1로 남은 공간 차지 */}
            <span className="font-bold text-gray-800 flex-1 min-w-0 truncate">
              {solution.title}
            </span>

            <span className="font-bold text-gray-800 flex-1 min-w-0 truncate">
            {solution.price?.toLocaleString()}원
            </span>

            {/* 버튼 영역 - 오른쪽 정렬, 고정 너비 */}
            <div className="flex gap-2 justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedSolution(solution)}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
                    await addCartItem({ projectid: projectId, solutionid: solution.solutionid}); // addCartItem 사용
                    alert("장바구니에 추가되었습니다.");
                  } catch (error) {
                    console.error("장바구니 추가 실패", error);
                    alert("장바구니 추가에 실패했습니다.");
                  }
                }}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
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
          onPurchase={() => {
            console.log("구매하기:", selectedSolution);
            // 구매 로직 추후 구현
            alert("구매 기능은 추후 구현 예정입니다.");
          }}
          onDelete={async () => {
            if (window.confirm("솔루션을 정말 삭제하시겠습니까?")) {
              try {
                await removeSolution(selectedSolution.solutionid);
                alert("삭제되었습니다. 전략추천에서 다시 생성하실 수 있습니다.");
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
