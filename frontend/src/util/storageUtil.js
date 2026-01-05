// frontend/src/util/storageUtil.js
// 전략 추천 결과 localStorage 관리 유틸리티

export const StrategyResultStorage = {
  // 저장 키 생성
  getStorageKey: (brandId, projectId) => {
    return `strategy_result_${brandId}_${projectId}`;
  },

  // 결과 저장
  save: (brandId, projectId, result) => {
    try {
      const key = StrategyResultStorage.getStorageKey(brandId, projectId);
      const data = {
        result,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log("[StrategyResultStorage] 결과 저장 완료", {
        brandId,
        projectId,
      });
    } catch (error) {
      console.error("[StrategyResultStorage] localStorage 저장 실패:", error);
      // localStorage 용량 초과 시 이전 데이터 삭제 후 재시도
      if (error.name === "QuotaExceededError") {
        console.warn(
          "[StrategyResultStorage] localStorage 용량 초과, 오래된 데이터 삭제 시도"
        );
        StrategyResultStorage.clearOldData();
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (retryError) {
          console.error("[StrategyResultStorage] 재시도 실패:", retryError);
        }
      }
    }
  },

  // 결과 조회
  load: (brandId, projectId) => {
    try {
      const key = StrategyResultStorage.getStorageKey(brandId, projectId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      // 24시간 이내 데이터만 유효 (선택사항)
      const maxAge = 24 * 60 * 60 * 1000; // 24시간
      if (Date.now() - data.timestamp > maxAge) {
        localStorage.removeItem(key);
        console.log("[StrategyResultStorage] 만료된 데이터 삭제", {
          brandId,
          projectId,
        });
        return null;
      }

      console.log("[StrategyResultStorage] 결과 복원 완료", {
        brandId,
        projectId,
      });
      return data.result;
    } catch (error) {
      console.error("[StrategyResultStorage] localStorage 조회 실패:", error);
      return null;
    }
  },

  // 결과 삭제
  clear: (brandId, projectId) => {
    try {
      const key = StrategyResultStorage.getStorageKey(brandId, projectId);
      localStorage.removeItem(key);
      console.log("[StrategyResultStorage] 결과 삭제 완료", {
        brandId,
        projectId,
      });
    } catch (error) {
      console.error("[StrategyResultStorage] localStorage 삭제 실패:", error);
    }
  },

  // 오래된 데이터 정리 (24시간 이상 된 데이터)
  clearOldData: () => {
    try {
      const maxAge = 24 * 60 * 60 * 1000; // 24시간
      const now = Date.now();
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("strategy_result_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp && now - data.timestamp > maxAge) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // 파싱 실패한 데이터도 삭제
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        console.log(
          `[StrategyResultStorage] 오래된 데이터 ${keysToRemove.length}개 삭제`
        );
      }
    } catch (error) {
      console.error("[StrategyResultStorage] 오래된 데이터 정리 실패:", error);
    }
  },
};
