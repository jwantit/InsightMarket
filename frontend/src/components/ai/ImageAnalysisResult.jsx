// src/components/ai/ImageAnalysisResult.jsx
import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
  Search,
  Sparkles,
} from "lucide-react";

const ImageAnalysisResult = ({ result, imagePreview }) => {
  // 1. Radar Chart 데이터 변환
  const radarData = useMemo(
    () => [
      { axis: "자극성", value: result?.metrics?.자극성 || 0 },
      { axis: "가독성", value: result?.metrics?.가독성 || 0 },
      { axis: "감성", value: result?.metrics?.감성 || 0 },
      { axis: "전문성", value: result?.metrics?.전문성 || 0 },
      { axis: "신뢰도", value: result?.metrics?.신뢰도 || 0 },
    ],
    [result]
  );

  // 2. 종합 점수 계산
  const totalScore = useMemo(() => {
    const values = Object.values(result?.metrics || {});
    if (values.length === 0) return 0;
    return Math.round(
      values.reduce((a, b) => a + Number(b), 0) / values.length
    );
  }, [result]);

  if (!result) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* [섹션 1] 이미지 및 종합 점수 (8컬럼) */}
      <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <Target size={14} className="text-blue-600" /> 분석 대상 이미지
          </div>
          <img
            src={imagePreview}
            className="w-full h-auto rounded-3xl shadow-lg border-4 border-slate-50"
            alt="analyzed"
          />
        </div>
        <div className="w-full md:w-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20">
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
            종합 점수
          </p>
          <div className="relative">
            <span className="text-8xl font-black text-blue-400 tracking-tighter">
              {totalScore}
            </span>
            <span className="absolute -top-2 -right-4 text-xl font-bold text-slate-600">
              /100
            </span>
          </div>
          <div className="mt-6 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${totalScore}%` }}
            />
          </div>
          <p className="mt-4 text-[11px] font-medium text-slate-400 leading-relaxed italic">
            Marketing Impact Score
          </p>
        </div>
      </div>

      {/* [섹션 2] 지표 레이더 차트 (4컬럼) */}
      <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
          <TrendingUp size={14} className="text-blue-600" /> 항목별 세부 진단
        </div>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis
                dataKey="axis"
                tick={({ payload, x, y, cx, cy, index }) => {
                  const angle = (index * 360) / radarData.length;
                  const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                  const extendedRadius = radius + 20; // 레이블을 더 바깥쪽으로
                  const angleRad = (angle * Math.PI) / 180;
                  const newX = cx + extendedRadius * Math.sin(angleRad);
                  const newY = cy - extendedRadius * Math.cos(angleRad);
                  const value = radarData[index]?.value || 0;

                  return (
                    <g>
                      <text
                        x={newX}
                        y={newY}
                        fill="#64748b"
                        fontSize={11}
                        fontWeight={900}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {payload.value}
                      </text>
                      <text
                        x={newX}
                        y={newY + 16}
                        fill="#3b82f6"
                        fontSize={13}
                        fontWeight={900}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {value}
                      </text>
                    </g>
                  );
                }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
                strokeWidth={3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* [섹션 3] 추출된 텍스트 OCR (12컬럼) */}
      <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
          <Search size={14} className="text-blue-600" /> 추출된 텍스트 컨텐츠
          (OCR)
        </div>
        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-mono text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {result.extractedText || "텍스트를 감지하지 못했습니다."}
        </div>
      </div>

      {/* [섹션 4] 장점 분석 (6컬럼) */}
      <div className="lg:col-span-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 hover:shadow-md transition-shadow">
        <h4 className="flex items-center gap-2 text-sm font-black text-emerald-700 uppercase tracking-widest mb-6">
          <CheckCircle2 size={18} /> 장점
        </h4>
        <div className="space-y-4">
          {result.pros?.map((pro, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <p className="text-sm font-bold text-emerald-900 leading-relaxed">
                {pro}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* [섹션 5] 개선 사항 분석 (6컬럼) */}
      <div className="lg:col-span-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 p-8 hover:shadow-md transition-shadow">
        <h4 className="flex items-center gap-2 text-sm font-black text-rose-700 uppercase tracking-widest mb-6">
          <AlertTriangle size={18} /> 개선 사항
        </h4>
        <div className="space-y-4">
          {result.cons?.map((con, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
              <p className="text-sm font-bold text-rose-900 leading-relaxed">
                {con}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* [섹션 6] AI 최적화 전략 제안 (12컬럼 - 전체 너비 및 어두운 색상 강조) */}
      <div className="lg:col-span-12 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-[3rem] shadow-2xl p-10 text-white relative overflow-hidden group border border-white/10 mt-4">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
              <Sparkles size={20} className="text-white" />
            </div>
            <h4 className="text-lg font-black uppercase tracking-[0.2em] text-blue-200">
              AI Vision Optimization Strategy
            </h4>
          </div>

          <p className="text-lg md:text-xl font-bold leading-relaxed max-w-5xl tracking-tight text-white/95">
            {result.recommendations}
          </p>

          <div className="mt-10 flex items-center gap-6 text-blue-300/40 font-black text-[10px] uppercase tracking-[0.3em]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-blue-500" />
              <span>Ad Effectiveness Predicted</span>
            </div>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-blue-500" />
              <span>Vision AI Intelligence</span>
            </div>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-blue-500" />
              <span>Conversion Optimization</span>
            </div>
          </div>
        </div>

        {/* 우측 하단 장식용 아이콘 */}
        <Sparkles
          size={200}
          className="absolute -bottom-16 -right-16 text-white/5 rotate-12 group-hover:scale-110 group-hover:text-white/10 transition-all duration-700"
        />
      </div>
    </div>
  );
};

export default ImageAnalysisResult;
