const FetchingModal = ({ solution, onClose, onPurchase, onDelete }) => {
  if (!solution) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[1055] flex h-full w-full justify-center items-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white shadow-lg rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">AISolution</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 이미지 */}
          {solution.imageurl && (
            <div className="flex justify-center">
              <img
                src={solution.imageurl}
                alt={solution.title}
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">Solution</label>
              <p className="text-lg font-bold text-gray-800 mt-1">{solution.title}</p>
            </div>

            {solution.projectname && (
              <div>
                <label className="text-sm font-semibold text-gray-500">프로젝트</label>
                <p className="text-gray-800 mt-1">{solution.projectname}</p>
              </div>
            )}


            {solution.strategytitle && (
              <div>
                <label className="text-sm font-semibold text-gray-500">전략</label>
                <p className="text-gray-800 mt-1">{solution.strategytitle}</p>
              </div>
            )}


            {solution.createdAt && (
              <div>
                <label className="text-sm font-semibold text-gray-500">생성일</label>
                <p className="text-gray-800 mt-1">{solution.createdAt}</p>
              </div>
            )}

               <div>
              <label className="text-sm font-semibold text-gray-500">가격</label>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {solution.price?.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3 justify-between">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                삭제
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
            >
              닫기
            </button>
            <button
              onClick={onPurchase}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FetchingModal;

