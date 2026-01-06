import React from "react";
import { Bar } from "react-chartjs-2";

const SentimentTrendComponent = ({ sentimentBarData, stackedBarOptions }) => {
  return (
    <div className="lg:col-span-9">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">긍·부정 추이</h3>
          <p className="text-xs text-gray-500">스택(%) 기준 / 일자별 분포</p>
        </div>
      </div>

      {sentimentBarData ? (
        <div className="relative rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 p-6 shadow-inner">
          <div className="h-96">
            <Bar data={sentimentBarData} options={stackedBarOptions} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50/50 border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500 font-medium">데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default SentimentTrendComponent;

