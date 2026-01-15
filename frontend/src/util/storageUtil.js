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

// 이미지 분석 결과 localStorage 관리 유틸리티
export const ImageAnalysisStorage = {
  // 저장 키 생성 (brandId 기반, 최근 N개 저장)
  getStorageKey: (index) => {
    return `image_analysis_${index}`;
  },

  // 최근 분석 이력 목록 조회
  getRecentList: (maxItems = 10) => {
    try {
      const items = [];
      for (let i = 0; i < maxItems; i++) {
        const key = ImageAnalysisStorage.getStorageKey(i);
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            items.push({
              ...data,
              index: i,
            });
          } catch (e) {
            // 파싱 실패한 데이터 삭제
            localStorage.removeItem(key);
          }
        }
      }
      return items.filter((item) => item && item.timestamp);
    } catch (error) {
      console.error("[ImageAnalysisStorage] 목록 조회 실패:", error);
      return [];
    }
  },

  // 결과 저장 (최신 항목을 인덱스 0에 저장, 나머지는 뒤로 이동)
  save: (result) => {
    try {
      const maxItems = 10;
      
      // 기존 항목들을 한 칸씩 뒤로 이동
      for (let i = maxItems - 2; i >= 0; i--) {
        const oldKey = ImageAnalysisStorage.getStorageKey(i);
        const newKey = ImageAnalysisStorage.getStorageKey(i + 1);
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          localStorage.setItem(newKey, oldData);
        } else {
          localStorage.removeItem(newKey);
        }
      }

      // 새 항목을 인덱스 0에 저장
      const key = ImageAnalysisStorage.getStorageKey(0);
      const data = {
        result,
        timestamp: Date.now(),
        imagePreview: result.imagePreview || null, // 이미지 미리보기 URL (선택)
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log("[ImageAnalysisStorage] 결과 저장 완료");
    } catch (error) {
      console.error("[ImageAnalysisStorage] localStorage 저장 실패:", error);
      if (error.name === "QuotaExceededError") {
        console.warn("[ImageAnalysisStorage] localStorage 용량 초과, 오래된 데이터 삭제 시도");
        ImageAnalysisStorage.clearOldData();
        try {
          const key = ImageAnalysisStorage.getStorageKey(0);
          localStorage.setItem(key, JSON.stringify(data));
        } catch (retryError) {
          console.error("[ImageAnalysisStorage] 재시도 실패:", retryError);
        }
      }
    }
  },

  // 특정 인덱스의 결과 조회
  load: (index) => {
    try {
      const key = ImageAnalysisStorage.getStorageKey(index);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const data = JSON.parse(stored);
      return data.result;
    } catch (error) {
      console.error("[ImageAnalysisStorage] localStorage 조회 실패:", error);
      return null;
    }
  },

  // 특정 인덱스의 결과 삭제
  remove: (index) => {
    try {
      const key = ImageAnalysisStorage.getStorageKey(index);
      localStorage.removeItem(key);
      
      // 삭제된 항목 뒤의 항목들을 앞으로 이동
      const maxItems = 10;
      for (let i = index + 1; i < maxItems; i++) {
        const oldKey = ImageAnalysisStorage.getStorageKey(i);
        const newKey = ImageAnalysisStorage.getStorageKey(i - 1);
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          localStorage.setItem(newKey, oldData);
          localStorage.removeItem(oldKey);
        } else {
          localStorage.removeItem(newKey);
        }
      }
      
      console.log("[ImageAnalysisStorage] 결과 삭제 완료", { index });
    } catch (error) {
      console.error("[ImageAnalysisStorage] localStorage 삭제 실패:", error);
    }
  },

  // 모든 결과 삭제
  clearAll: () => {
    try {
      const maxItems = 10;
      for (let i = 0; i < maxItems; i++) {
        const key = ImageAnalysisStorage.getStorageKey(i);
        localStorage.removeItem(key);
      }
      console.log("[ImageAnalysisStorage] 모든 결과 삭제 완료");
    } catch (error) {
      console.error("[ImageAnalysisStorage] 전체 삭제 실패:", error);
    }
  },

  // 오래된 데이터 정리 (7일 이상 된 데이터)
  clearOldData: () => {
    try {
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
      const now = Date.now();
      const maxItems = 10;

      for (let i = 0; i < maxItems; i++) {
        const key = ImageAnalysisStorage.getStorageKey(i);
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.timestamp && now - data.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // 파싱 실패한 데이터도 삭제
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("[ImageAnalysisStorage] 오래된 데이터 정리 실패:", error);
    }
  },
};