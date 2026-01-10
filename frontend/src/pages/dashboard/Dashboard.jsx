// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LayoutDashboard, Activity, Heart } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import DashboardFilter from "../../components/dashboard/DashboardFilter";
import BrandMentionSummary from "../../components/dashboard/BrandMentionSummary";
import BrandSentimentSummary from "../../components/dashboard/BrandSentimentSummary";
import { getBrandWordCloudData } from "../../api/dashboardApi";

const Dashboard = () => {
  const { brandId } = useParams();
  const [appliedChannels, setAppliedChannels] = useState(["NAVER", "YOUTUBE"]);
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
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      {/* 1. 세련된 통합 헤더 (필터 포함) */}
      <PageHeader
        icon={LayoutDashboard}
        title="브랜드 대시보드"
        breadcrumb="Analytics / Dashboard"
        subtitle="수집된 데이터를 기반으로 브랜드의 소셜 언급량과 감성 상태를 실시간으로 분석합니다."
        extra={
          <DashboardFilter
            appliedChannels={appliedChannels}
            handleToggle={handleToggle}
          />
        }
      />

      <div className="space-y-14">
        {/* 2. 언급량 분석 섹션 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
              언급량 분석
            </h3>
            <div className="h-px flex-1 bg-slate-200 opacity-50" />
          </div>
          <BrandMentionSummary
            brandId={brandId}
            appliedChannels={appliedChannels}
          />
        </section>

        {/* 3. 긍·부정 분석 섹션 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
              <Heart size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
              긍 · 부정 분석
            </h3>
            <div className="h-px flex-1 bg-slate-200 opacity-50" />
          </div>
          <BrandSentimentSummary
            brandId={brandId}
            appliedChannels={appliedChannels}
            wordData={wordData}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
