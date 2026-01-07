// src/pages/ai/StrategyPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  BrainCircuit,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  FileText,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

// API 및 유틸리티
import {
  askAiInsight,
  generateSolutionReport,
  saveReportAsSolution,
  getFreeReportCount,
} from "../../api/insightAiApi";
import { getErrorMessage } from "../../util/errorUtil";
import { getProjectsByTenant } from "../../api/selectProjectApi";
import { StrategyResultStorage } from "../../util/storageUtil";

// 공통 디벨롭 헤더 컴포넌트
import PageHeader from "../../components/common/PageHeader";

const StrategyPage = () => {
  const { brandId } = useParams();

  // --- 상태 관리 ---
  const [projectId, setProjectId] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [topK, setTopK] = useState(3);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [traceId, setTraceId] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [generatingReport, setGeneratingReport] = useState(false);
  const [freeReportCount, setFreeReportCount] = useState(0);

  // --- 데이터 로드 ---
  useEffect(() => {
    if (!brandId) return;

    getProjectsByTenant(brandId).then((res) => {
      setProjectList(res || []);
      if (res && res.length > 0 && !projectId) setProjectId(res[0].projectId);
    });

    getFreeReportCount(brandId).then((count) => setFreeReportCount(count || 0));
  }, [brandId]);

  // 로컬 스토리지 결과 복원
  useEffect(() => {
    if (!brandId || !projectId) return;
    const savedData = StrategyResultStorage.load(brandId, projectId);
    if (savedData) {
      setResult(savedData.result || savedData);
      setQuestion(savedData.question || "");
      setTraceId(savedData.traceId || null);
    }
  }, [brandId, projectId]);

  // --- 분석 요청 핸들러 ---
  const onSubmit = async () => {
    if (!projectId || !question?.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await askAiInsight({
        brandId: Number(brandId),
        projectId: Number(projectId),
        question,
        topK: Number(topK),
      });
      setTraceId(res.traceId);
      setResult(res.data);
      if (res.data) {
        StrategyResultStorage.save(brandId, projectId, {
          result: res.data,
          question,
          traceId: res.traceId,
        });
      }
    } catch (e) {
      setError(getErrorMessage(e) || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // --- 리포트 생성 핸들러 ---
  const handleGenerateReport = async (solutionTitle) => {
    setGeneratingReport(true);
    try {
      const selectedProject = projectList.find(
        (p) => p.projectId === projectId
      );
      const res = await generateSolutionReport({
        brandId: Number(brandId),
        projectId: Number(projectId),
        projectName: selectedProject?.name || "",
        question,
        solutionTitle,
        solutionDescription: "",
        relatedProblems: result?.data?.problems || [],
        relatedInsights: result?.data?.insights || [],
        reportType: "marketing",
        traceId,
      });

      if (res.data?.ok) {
        await saveReportAsSolution({
          brandId: Number(brandId),
          projectId: Number(projectId),
          solutionTitle,
          reportContent: res.data.report.content,
          reportType: "marketing",
          traceId,
        });
        alert("리포트가 생성되었습니다. 솔루션 마켓에서 확인하세요.");
        getFreeReportCount(brandId).then(setFreeReportCount);
      }
    } catch (e) {
      alert("리포트 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const ok = result?.ok === true;
  const data = result?.data || null;

  // --- 헤더 우측에 들어갈 무료 리포트 카운터 ---
  const headerExtra = (
    <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
          Free Report
        </p>
        <p className="text-sm font-black text-blue-600 leading-none mt-0.5">
          {freeReportCount} / 1
        </p>
      </div>
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
        <Sparkles size={16} />
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      {/* [1] 디벨롭된 페이지 헤더 적용 (AI 모드) */}
      <PageHeader
        isAi={true}
        icon={BrainCircuit}
        title="전략 추천"
        breadcrumb="AI Marketing / Strategy"
        subtitle="소셜 데이터와 트렌드를 AI가 분석하여 타겟 맞춤형 마케팅 실행 전략을 도출합니다."
        extra={headerExtra}
      />

      {/* [2] 입력 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 h-full">
            <div>
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
                <Target size={14} className="text-blue-600" /> 프로젝트 선택
              </label>
              <select
                value={projectId ?? ""}
                onChange={(e) =>
                  setProjectId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none"
              >
                <option value="">프로젝트 선택</option>
                {projectList.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
                <Zap size={14} className="text-blue-600" /> 분석 정밀도
              </label>
              <div className="px-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-3">
                  <span>Fast</span>
                  <span className="text-blue-600 font-black">Top-{topK}</span>
                  <span>Deep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full group focus-within:border-blue-500 transition-all">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
              <Lightbulb size={14} className="text-amber-500" /> 분석 질문 입력
            </label>
            <div className="relative flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full h-full p-4 pb-14 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-base font-medium focus:ring-0 outline-none transition-all resize-none min-h-[140px]"
                placeholder="어떤 마케팅 인사이트가 필요하신가요?"
              />
              <button
                onClick={onSubmit}
                disabled={loading || !projectId || !question.trim()}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                전략 도출 시작
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* [3] 로딩 및 결과 표시 */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center animate-in zoom-in duration-300">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <BrainCircuit
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600"
              size={32}
            />
          </div>
          <p className="text-slate-900 font-black text-xl mb-2">
            AI가 전략을 구상하고 있습니다
          </p>
          <p className="text-slate-500 text-sm font-medium">
            데이터의 양에 따라 최대 1분 정도 소요될 수 있습니다.
          </p>
        </div>
      )}

      {result && ok && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* AI 종합 진단 (Bento Style) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  AI 마케팅 종합 진단
                </h3>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <AlertTriangle size={14} /> 위험 요소 분석
                </h4>
                <div className="space-y-3">
                  {result.report?.keyIssues?.map((issue, i) => (
                    <div
                      key={i}
                      className="p-5 bg-red-50/50 border border-red-100 rounded-2xl group hover:bg-red-50 transition-all"
                    >
                      <p className="text-sm font-bold text-red-900">
                        {issue.title}
                      </p>
                      <p className="text-xs text-red-700/70 mt-1.5 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CheckCircle2 size={14} /> 최적 실행 전략
                </h4>
                <div className="space-y-3">
                  {result.report?.strategies?.map((strat, i) => (
                    <div
                      key={i}
                      className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl group hover:bg-emerald-50 transition-all"
                    >
                      <p className="text-sm font-bold text-emerald-900">
                        {strat.title}
                      </p>
                      <p className="text-xs text-emerald-700/70 mt-1.5 leading-relaxed">
                        {strat.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {result.report?.executiveSummary && (
              <div className="px-8 pb-8">
                <div className="p-6 bg-slate-900 rounded-2xl text-blue-100 text-sm italic text-center leading-relaxed">
                  "{result.report.executiveSummary}"
                </div>
              </div>
            )}
          </div>

          {/* 세부 솔루션 리스트 */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">
                Core Solutions
              </h3>
              <div className="h-px flex-1 bg-slate-200 opacity-60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data?.solutions?.map((solution, idx) => (
                <div
                  key={idx}
                  className="group bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-8 font-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg mb-8 leading-tight group-hover:text-blue-600 transition-colors">
                      {typeof solution === "string" ? solution : solution.title}
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      handleGenerateReport(
                        typeof solution === "string" ? solution : solution.title
                      )
                    }
                    disabled={generatingReport}
                    className="w-full py-4 bg-slate-100 group-hover:bg-slate-900 text-slate-900 group-hover:text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {generatingReport ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        심층 리포트 생성 <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4 text-red-700 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-bold leading-relaxed">{error}</div>
        </div>
      )}
    </div>
  );
};

export default StrategyPage;
