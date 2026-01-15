

const MarketRow = ({ solutions }) => {
    return (
      <div className="grid grid-cols-4 gap-4 px-4 py-3 items-center border-t text-sm">
        {/* No */}
        <span className="text-gray-500">
          {solutions.solutionid}
        </span>
  
        {/* 이미지 */}
        <div>
          {solutions.imageUrl ? (
            <img
              src={solutions.imageUrl}
              alt={solutions.name}
              className="w-10 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
              No Img
            </div>
          )}
        </div>
  
        {/* 상품명 */}
        <span className="font-medium text-gray-800 truncate">
          {solutions.name}
        </span>
  
        {/* 가격 */}
        <span className="text-right font-semibold text-gray-900">
          {solutions.price?.toLocaleString()}원
        </span>
      </div>
    );
  };
  
  export default MarketRow;
  