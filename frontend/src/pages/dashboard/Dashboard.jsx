import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardFilter from "../../components/dashboard/DashboardFilter";
import BrandMentionSummary from "../../components/dashboard/BrandMentionSummary";
import BrandSentimentSummary from "../../components/dashboard/BrandSentimentSummary";
import { getBrandWordCloudData } from "../../api/dashboard/dashboard";

const Dashboard = () => {
  // 토글 시 바로 적용되도록 appliedChannels만 사용
  const [appliedChannels, setAppliedChannels] = useState(["NAVER", "YOUTUBE"]);

  const { brandId } = useParams();

  // 워드 클라우드 데이터
  const [wordData, setWordData] = useState([]);

  useEffect(() => {
    const fetchWordData = async () => {
      const response = await getBrandWordCloudData(brandId, appliedChannels);
      setWordData(response);
    };
    fetchWordData();
  }, [brandId, appliedChannels]);

  const handleToggle = (channel) => {
    if (appliedChannels.includes(channel)) {
      if (appliedChannels.length > 1) {
        setAppliedChannels(appliedChannels.filter((c) => c !== channel));
      } else {
        alert("최소 하나는 선택해야 합니다.");
      }
    } else {
      setAppliedChannels([...appliedChannels, channel]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {" "}
      {/* 3. 반드시 하나의 태그로 감싸야 함 */}
      <DashboardFilter
        appliedChannels={appliedChannels}
        handleToggle={handleToggle}
      />
      <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">
        언급량 분석
      </h3>
      <BrandMentionSummary
        brandId={brandId}
        appliedChannels={appliedChannels} // 확정된 채널만 자식에게 전달
      />
      <h3 className="text-lg font-extrabold text-gray-800 tracking-tight">
        긍 · 부정 분석
      </h3>
      <BrandSentimentSummary
        brandId={brandId}
        appliedChannels={appliedChannels} // 확정된 채널만 자식에게 전달
        wordData={wordData}
      />
    </div>
  );
};

export default Dashboard;
