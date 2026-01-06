import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import SolutionToolbar from "../../components/maket/SolutionToolbar";
import CartComponent from "../../components/maket/CartComponent";
import { getProjectsByTenant } from "../../api/selectProjectApi";

const CartPage = () => {
  const { brandId } = useParams(); // 브랜드 명을 가져온다.
  const [searchParams] = useSearchParams(); // 쿼리스트링 가져온 solution?project=2 등등
  const navigate = useNavigate(); // url 변경시
  const isInitialMount = useRef(true); // 렌더링 체크용

  // ✅ URL 쿼리 파라미터에서 초기값 가져오기
  const projectIdFromUrl = searchParams.get("projectId"); // 쿼리스트링 ?projectId=2 가져옴

  // 현재프로젝트, 프로젝트리스트
  // 선택한 프로젝트ID -> 초기값은 NULL이지만 useEffect 실행을 통해 가져와 진다
  // URL에 projectId가 있으면 그 값 사용
  const [projectId, setProjectId] = useState(
    projectIdFromUrl ? Number(projectIdFromUrl) : null
  );
  // 프로젝트 목록(프로젝트 선택 슬라이드에 사용)
  // 백엔드에서 가져와서 저장될 STATE
  const [projectList, setProjectList] = useState([]); // 백엔드에서 불러올 목록

  // URL 쿼리 파라미터 업데이트 함수
  const updateUrlParams = useCallback(
    (newProjectId) => {
      const params = new URLSearchParams(); // 새 쿼리스트링 준비
      if (newProjectId) {
        // 만약 프로젝트 아이디가 존재한다면
        params.set("projectId", newProjectId.toString());
      }
      // 한번에 쿼리로 반영 ?projectId=1
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate] // 쿼리 변경됨 감지 정확히는 주소가 변경됐을 경우
  );

  // tenant 브랜드 기준 프로젝트 조회
  useEffect(() => {
    if (!brandId) return;

    // 프로젝트 목록조회 브랜드id전달 -> selectProjectAPI.js -> 백엔드 호출 응답
    getProjectsByTenant(brandId)
      .then((res) => {
        setProjectList(res); // 프로젝트 리스트를 useState 올림

        console.log("프로젝트 목록:", res);

        // 쿼리 파라미터에 projectId가 없고, 백엔드에서 받아온 프로젝트 목록이 1개 이상 있을 때
        if (!projectIdFromUrl && res.length > 0) {
          // 받아온 0번째 프로젝트리스트의 projectId를 담고
          const firstProjectId = res[0].projectId;
          setProjectId(firstProjectId); // const [projectId, setProjectId] = useState( 여기에 set
          // 쿼리 스트링에 반영하기 위해 함수 호출
          updateUrlParams(firstProjectId);

          // 쿼리스트링에 projectid 값이 있는 경우 실행
        } else if (projectIdFromUrl) {
          const exists = res.some(
            // 백엔드 배열 안에서 조건을 만족하는 값이 하나라도 있으면 true
            (p) => p.projectId === Number(projectIdFromUrl) // 백엔드 데이터 projectid = 3 == 쿼리의 projectid = 3 가 같으면 TRUE
          );
          // 서로 다르다면
          if (!exists && res.length > 0) {
            // URL의 projectId가 유효하지 않으면 첫 프로젝트로 변경
            const firstProjectId = res[0].projectId;
            setProjectId(firstProjectId);
            updateUrlParams(firstProjectId);
          }
        }
      })
      .catch((err) => {
        console.error("프로젝트 목록 조회 실패", err);
      });
  }, [brandId, projectIdFromUrl, updateUrlParams]);

  // projectId 변경 시 URL 업데이트 (초기 마운트 제외)
  useEffect(() => {
    if (isInitialMount.current) {
      // 초기 마운트 제외
      isInitialMount.current = false;
      return;
    }

    // projectId가 존재하면
    if (projectId !== null) {
      updateUrlParams(projectId); // 쿼리스트링 반영
    }
  }, [projectId, updateUrlParams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Solution 장바구니
            </h1>
            <p className="text-sm text-slate-500">
              선택한 솔루션을 확인하고 결제하세요.
            </p>
          </div>
        </div>
      </div>

      <SolutionToolbar
        projectList={projectList}
        projectId={projectId}
        onProjectChange={setProjectId}
        filter={undefined}
        onFilterChange={undefined}
        showFilter={false}
      />
      <CartComponent projectId={projectId} />
    </div>
  );
};

export default CartPage;
