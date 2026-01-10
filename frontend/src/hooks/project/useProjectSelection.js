// src/hooks/useProjectSelection.js
// ============================================================
// [기능] 프로젝트 선택 공통 로직
// - Market 페이지와 Strategy 페이지에서 재사용
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getProjectsByTenant } from "../../api/selectProjectApi";
import { getErrorMessage } from "../../util/errorUtil";

/**
 * 프로젝트 선택 공통 hook
 * @param {string} brandId - 브랜드 ID
 * @param {boolean} useUrlParams - URL 쿼리 파라미터 사용 여부 (기본값: true)
 * @returns {object} { projectId, projectList, setProjectId, loading, error }
 */
export const useProjectSelection = (brandId, useUrlParams = true) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // URL에서 초기값 가져오기
  const projectIdFromUrl = useUrlParams ? searchParams.get("projectId") : null;

  const [projectId, setProjectId] = useState(
    projectIdFromUrl ? Number(projectIdFromUrl) : null
  );
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL 쿼리 파라미터 업데이트 함수
  const updateUrlParams = useCallback(
    (newProjectId) => {
      if (!useUrlParams) return;
      
      const params = new URLSearchParams();
      if (newProjectId) {
        params.set("projectId", newProjectId.toString());
      }
      navigate({ search: params.toString() }, { replace: true });
    },
    [navigate, useUrlParams]
  );

  // 프로젝트 목록 조회
  useEffect(() => {
    if (!brandId) return;

    setLoading(true);
    setError(null);

    getProjectsByTenant(brandId)
      .then((res) => {
        setProjectList(res);

        // URL에 projectId가 없고, 프로젝트 목록이 있으면 첫 번째 프로젝트 선택
        if (!projectIdFromUrl && res.length > 0) {
          const firstProjectId = res[0].projectId;
          setProjectId(firstProjectId);
          if (useUrlParams) {
            updateUrlParams(firstProjectId);
          }
        } else if (projectIdFromUrl) {
          // URL의 projectId가 유효한지 확인
          const exists = res.some(
            (p) => p.projectId === Number(projectIdFromUrl)
          );
          if (!exists && res.length > 0) {
            // 유효하지 않으면 첫 프로젝트로 변경
            const firstProjectId = res[0].projectId;
            setProjectId(firstProjectId);
            if (useUrlParams) {
              updateUrlParams(firstProjectId);
            }
          }
        }
      })
      .catch((err) => {
        console.error("[useProjectSelection] 프로젝트 목록 조회 실패", err);
        setError(getErrorMessage(err, "프로젝트 목록을 불러오는데 실패했습니다."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [brandId, projectIdFromUrl, updateUrlParams, useUrlParams]);

  // projectId 변경 시 URL 업데이트 (초기 마운트 제외)
  useEffect(() => {
    if (!useUrlParams) return;
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (projectId !== null) {
      updateUrlParams(projectId);
    }
  }, [projectId, updateUrlParams, useUrlParams]);

  return {
    projectId,
    projectList,
    setProjectId,
    loading,
    error,
  };
};

