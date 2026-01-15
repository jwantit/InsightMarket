import { useMemo, useState } from "react";

// 기존 파일 목록 기반 keepFileIds를 관리하는 공통 훅
// initialFiles: [{ id, originalName, ... }]
const useKeepFiles = (initialFiles = []) => {
  const initialIds = useMemo(
    () => (initialFiles || []).map((f) => f.id),
    [initialFiles]
  );
  const [keepIds, setKeepIds] = useState(initialIds);

  const toggleKeep = (fileId) => {
    setKeepIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const resetKeep = () => setKeepIds(initialIds);

  return { keepFileIds: keepIds, toggleKeep, resetKeep };
};

export default useKeepFiles;