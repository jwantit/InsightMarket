import { useParams } from "react-router-dom";

const toNumber = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid route param: ${value}`);
  }
  return parsed;
};

// brandId / boardId를 숫자로 변환해 반환
const useBoardRouteParams = () => {
  const params = useParams();
  const brandId = toNumber(params.brandId);
  const boardId = params.boardId ? toNumber(params.boardId) : null;

  return { brandId, boardId };
};

export default useBoardRouteParams;