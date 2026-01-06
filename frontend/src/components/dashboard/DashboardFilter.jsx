import React from 'react';

const DashboardFilter = ({ appliedChannels, handleToggle }) => {
  return (
    // top-8로 기존보다 조금 더 아래로 배치
    <div className="sticky top-8 z-50 w-full flex justify-center pointer-events-none transition-all duration-500">
      {/* - bg-white/10: 평소엔 아주 투명하게 (차트 가림 방지)
         - backdrop-blur-md: 투명해도 뒤가 은은하게 비침
         - hover:bg-white/90: 마우스 올리면 조작하기 쉽게 선명해짐
      */}
      <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-5 py-2 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 gap-6 pointer-events-auto transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
        
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-500 uppercase tracking-widest transition-colors">Filter</span>
          </div>
          
          {/* 네이버 토글 */}
          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4 transition-colors">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">NAVER</span>
            <button
              onClick={() => handleToggle('NAVER')}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                appliedChannels.includes('NAVER') ? 'bg-green-500/60 group-hover:bg-green-500' : 'bg-gray-200/40 group-hover:bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  appliedChannels.includes('NAVER') ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 유튜브 토글 */}
          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4 transition-colors">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">YOUTUBE</span>
            <button
              onClick={() => handleToggle('YOUTUBE')}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                appliedChannels.includes('YOUTUBE') ? 'bg-red-500/60 group-hover:bg-red-500' : 'bg-gray-200/40 group-hover:bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  appliedChannels.includes('YOUTUBE') ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilter;