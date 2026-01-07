import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import MaketComponent from "../../components/maket/MaketComponent";
import SolutionToolbar from "../../components/maket/SolutionToolbar";
import { getProjectsByTenant } from "../../api/selectProjectApi";

const MarketListPage = () => {
  const { brandId } = useParams(); // 브랜드 명을 가져온다.
  const [searchParams] = useSearchParams(); // 쿼리스트링 가져온 solution?project=2&filter 등등
  const navigate = useNavigate(); // url 변경시
  const isInitialMount = useRef(true); // 렌더링 체크용

  // ✅ URL 쿼리 파라미터에서 초기값 가져오기
  const projectIdFromUrl = searchParams.get("projectId"); // 쿼리스트링 ?projectId=2 가져옴

  const filterFromUrl = searchParams.get("filter") || "ALL"; // 쿼리스트링 &filter 값이 없으면 ALL이 기본값

  //현재프로젝트, 프로젝트리스트(슬라이드를 위해)------------------------------------------------------------------------------------------------

  // 선택한 프로젝트ID -> 초기값은 NULL이지만 useEffect 실행을 통해 가져와 진다
  //즉 선택한 프로젝트 슬라이드의 값이다.
  // URL에 projectId가 있으면 그 값 사용 //있다면 projectid = 3 이면  const projectId = 3
  const [projectId, setProjectId] = useState(
    projectIdFromUrl ? Number(projectIdFromUrl) : null
  );
  //프로젝트 목록(프로젝트 선택 슬라이드에 사용)
  //백엔드에서 가져와서 저장될 STATE
  const [projectList, setProjectList] = useState([]); // 백엔드에서 불러올 목록

  //-------------------------------------------------------------------------------------------------------

  //필터("ALL" "RESENT") 초기값-----------------------------------------------------------------------------
  //쿼리스트링이 없으면 "ALL"이 초기값값
  const [filter, setFilter] = useState(filterFromUrl);
  //--------------------------------------------------------------------------------------------------------

  // useEffect(() => { 에서 호출하여사용-------------------------------------------------------------------
  // URL 쿼리 파라미터 업데이트 함수
  const updateUrlParams = useCallback(
    //    3       ,  ALL
    (newProjectId, newFilter) => {
      const params = new URLSearchParams(); //새 쿼리스트링 준비
      if (newProjectId) {
        //만약 프로젝트 아이디가 존재한다면
        //?projectId = 1
        params.set("projectId", newProjectId.toString());
      }
      //만약 newFilter 가 있고  newFilter가 "ALL"이 아니라면
      if (newFilter && newFilter !== "ALL") {
        //&&filter = RESENT
        params.set("filter", newFilter);
      }
      //한번에 쿼리로 반영 ?projectId = 1&&filter = RESENT
      navigate({ search: params.toString() }, { replace: true }); // 프로젝트나 필터를 한번에 쿼리 projectId=3&filter=RECENT
    },
    [navigate] //쿼리 변경됨 감지 정확히는 주소가 변경됐을겨우
  ); //변경시 useState 초기값들도 이와 같이 반영
  //--------------------------------------------------------------------------------------------------------

  //tenant 브랜드 기준 프로젝트 조회
  useEffect(() => {
    if (!brandId) return;

    // 프로젝트 목록조회 브랜드id전달 ->  selectProjectAPI.js -> 백앤드 호출 응답
    //받아오는 데이터 리스트
    //JSON {
    //projectId : n,
    //name : 갤럭시 행사
    //}
    getProjectsByTenant(brandId)
      .then((res) => {
        setProjectList(res); // 프로젝트 리스트를 useState 올림

        console.log("프로젝트 목록:", res);

        //쿼리 파라미터 에 projectId가 없고, 백엔드에서 받아온 프로젝트 목록이 1개 이상 있을 때
        if (!projectIdFromUrl && res.length > 0) {
          //// 받아온 0번째 프로젝트리스트의 projectId 를 담고
          const firstProjectId = res[0].projectId;
          setProjectId(firstProjectId); // const [projectId, setProjectId] = useState( 여기에 set
          //쿼리 스트링에 반영하기 위해 함수 호출 -> 바로 위에 함수 있음
          updateUrlParams(firstProjectId, filter);

          //쿼리스트링에 projectid 값이 있는경우 실행
        } else if (projectIdFromUrl) {
          const exists = res.some(
            //백엔드 배열 안에서 조건을 만족하는 값이 하나라도 있으면 true
            (p) => p.projectId === Number(projectIdFromUrl) //백엔드 데이터 projectid = 3 == 쿼리의 projectid = 3 가 같으면 TRUE
          );
          //서로 다르다면
          if (!exists && res.length > 0) {
            // URL의 projectId가 유효하지 않으면 첫 프로젝트로 변경
            const firstProjectId = res[0].projectId;
            setProjectId(firstProjectId);
            updateUrlParams(firstProjectId, filter); // const updateUrlParams = useCallback(
          }
        }
      })
      .catch((err) => {
        console.error("프로젝트 목록 조회 실패", err);
      });
  }, [brandId, projectIdFromUrl, filter, updateUrlParams]);

  //-----------------------------------------------------------------------------------------
  //projectId 또는 filter 변경 시 URL 업데이트 (초기 마운트 제외)
  useEffect(() => {
    if (isInitialMount.current) {
      //초기 마운트 제외
      isInitialMount.current = false;
      return;
    }

    //projectId가 존재하면
    if (projectId !== null) {
      updateUrlParams(projectId, filter); //쿼리스트링 반영
    }
  }, [projectId, filter, updateUrlParams]);

  //-----------------------------------------------------------------------------------------

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      <PageHeader
        icon={ShoppingBag}
        title="AI Solution 상품목록"
        breadcrumb="Market / Solutions"
        subtitle="구매 가능한 AI 솔루션 리포트를 확인하고 장바구니에 추가할 수 있습니다."
      />

      {/* 필터 영역 */}
      <SolutionToolbar
        projectList={projectList}
        projectId={projectId}
        onProjectChange={setProjectId}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* 상품 리스트 */}
      {projectId && <MaketComponent projectId={projectId} filter={filter} />}
    </div>
  );
};

export default MarketListPage;
