import { useLocation, useNavigate } from "react-router-dom";

export const useBrandNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const changeBrandKeepPath = (nextBrandId) => {
    if (!nextBrandId) return;

    const parts = location.pathname.split("/");
    // 예: ["", "app", "3", "projects", "10"]

    if (parts.length >= 3 && parts[1] === "app") {
      parts[2] = String(nextBrandId); // brandId 교체
      navigate(parts.join("/"), { replace: true });
    } else {
      // fallback (거의 안 탐)
      navigate(`/app/${nextBrandId}`, { replace: true });
    }
  };

  return { changeBrandKeepPath };
};
