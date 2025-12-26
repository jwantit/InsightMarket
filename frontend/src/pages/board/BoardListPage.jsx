import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {fetchBoardList,selectBoardList} from "../../store/slices/boardSlice";
import useBoardRouteParams from "../../hooks/common/useBoardRouteParams";
import BoardList from "../../components/board/BoardList";
import PageComponent from "../../components/common/PageComponent";

const BoardListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { brandId } = useBoardRouteParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const size = Number(searchParams.get("size") || 10);

  const listResponse = useSelector((state) =>
    selectBoardList(state, { brandId, page, size })
  );

  useEffect(() => {
    dispatch(fetchBoardList({ brandId, page, size }));
  }, [brandId, page, size, dispatch]);

  const moveRead = (boardId) => {
    const query = searchParams.toString();
    navigate(
      `/app/${brandId}/board/discussion/read/${boardId}${
        query ? `?${query}` : ""
      }`
    );
  };

  const onChangePage = (nextPage) => {
    setSearchParams({ page: nextPage, size });
  };

  const onChangeSize = (nextSize) => {
    setSearchParams({ page: 1, size: nextSize });
  };

  return (
    <div className="space-y-4">
      <BoardList items={listResponse?.dtoList || []} onClickItem={moveRead} />
      <PageComponent
        pageResponse={listResponse}
        onChangePage={onChangePage}
        onChangeSize={onChangeSize}
      />
    </div>
  );
};

export default BoardListPage;