import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBoardList } from "../../api/boardApi";
import BoardList from "../../components/board/BoardList";

export default function StrategyBoard() {
    const { brandId } = useParams();

    const brandIdNum = Number(brandId);

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!brandIdNum) return;

    const fetchList = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const data = await getBoardList({ brandId: brandIdNum, page: 1, size: 10 });

        console.log("[GET][boards] brandId=", brandIdNum, "res=", data);
        setBoards(data.dtoList ?? []);
      } catch (err) {
        console.log("[GET][boards][ERROR]", err);
        setErrorMsg("게시글 목록 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [brandIdNum]);

  const handleItemClick = (board) => {
    console.log("[UI][boardClick]", board);
    // 다음 단계: getBoardDetail 붙일 자리
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Discussion</h1>

      <BoardList
        boards={boards}
        loading={loading}
        errorMsg={errorMsg}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
