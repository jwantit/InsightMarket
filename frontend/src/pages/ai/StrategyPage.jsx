// src/pages/ai/StrategyPage.jsx
// ============================================================
// [기능] 인사이트 기반 전략/솔루션 추천 페이지
// - React → Spring(/api/{brandId}/ai/ask) 호출
// - ok=true/false 분기 렌더링
// - traceId 표시
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  askAiInsight,
  generateSolutionReport,
  saveReportAsSolution,
  getFreeReportCount,
} from "../../api/insightAiApi";
import { getErrorMessage } from "../../util/errorUtil";
import { getProjectsByTenant } from "../../api/selectProjectApi";
import { StrategyResultStorage } from "../../util/storageUtil";

const StrategyPage = () => {
  const { brandId } = useParams();

  const [projectId, setProjectId] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [topK, setTopK] = useState(3);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [traceId, setTraceId] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // 리포트 생성 관련 상태
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportError, setReportError] = useState(null);

  // 무료 리포트 개수 상태
  const [freeReportCount, setFreeReportCount] = useState(0);

  // 프로젝트 목록 조회
  useEffect(() => {
    if (!brandId) return;
    getProjectsByTenant(brandId)
      .then((res) => {
        setProjectList(res || []);
        // 첫 번째 프로젝트를 기본 선택
        if (res && res.length > 0 && !projectId) {
          setProjectId(res[0].projectId);
        }
      })
      .catch((err) => {
        console.error("프로젝트 목록 조회 실패", err);
      });
  }, [brandId]);

  // 무료 리포트 개수 조회
  useEffect(() => {
    if (!brandId) return;
    getFreeReportCount(brandId)
      .then((count) => {
        setFreeReportCount(count || 0);
      })
      .catch((err) => {
        console.error("무료 리포트 개수 조회 실패", err);
        setFreeReportCount(0);
      });
  }, [brandId]);

  // 페이지 로드 시 또는 프로젝트 변경 시 localStorage에서 결과 복원
  useEffect(() => {
    if (!brandId || !projectId) return;

    const savedData = StrategyResultStorage.load(brandId, projectId);
    if (savedData) {
      // result 복원
      if (savedData.result) {
        setResult(savedData.result);
      } else {
        // 이전 버전 호환성 (result가 직접 저장된 경우)
        setResult(savedData);
      }

      // question 복원
      if (savedData.question) {
        setQuestion(savedData.question);
      }

      // traceId도 복원 (있으면)
      if (savedData.traceId) {
        setTraceId(savedData.traceId);
      }

      console.log("[StrategyPage] localStorage에서 결과 복원 완료", {
        brandId,
        projectId,
      });
    }
  }, [brandId, projectId]);

  const onSubmit = async () => {
    // 프로젝트와 질문 모두 필수
    if (!projectId || !question?.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setTraceId(null);

    try {
      console.log("[StrategyPage] submit", {
        brandId,
        projectId,
        topK,
        questionLen: question?.length,
      });

      const res = await askAiInsight({
        brandId: Number(brandId),
        projectId: Number(projectId),
        question,
        topK: Number(topK),
      });

      const traceIdValue = res.traceId || null;
      const resultData = res.data || null;

      setTraceId(traceIdValue);
      setResult(resultData);

      // localStorage에 결과 저장 (question 포함)
      if (resultData) {
        StrategyResultStorage.save(brandId, projectId, {
          result: resultData,
          question: question, // question도 함께 저장
          traceId: traceIdValue,
        });
      }
    } catch (e) {
      console.log("[StrategyPage] error", e);

      // Spring ErrorResponse 포맷 우선 처리 (code, message, timestamp)
      // 없으면 Python 응답의 reason 필드, 그 외 일반 에러 메시지
      const msg =
        getErrorMessage(e, null) ||
        e?.response?.data?.reason ||
        e?.response?.data?.detail ||
        "요청 처리 중 오류가 발생했습니다.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const ok = result?.ok === true;
  const data = result?.data || null;
  const sources = result?.sources || [];

  const getSectionColor = (title) => {
    if (title === "Insights")
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "💡",
      };
    if (title === "Problems")
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "⚠️",
      };
    if (title === "Solutions")
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "✅",
      };
    return {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      icon: "",
    };
  };

  // 솔루션 리포트 생성 및 저장 핸들러
  const handleGenerateReport = async (
    solutionTitle,
    solutionDescription = ""
  ) => {
    if (!projectId || !question?.trim()) {
      setReportError("프로젝트와 질문이 필요합니다.");
      return;
    }

    setGeneratingReport(true);
    setReportError(null);
    setCurrentReport(null);

    try {
      const selectedProject = projectList.find(
        (p) => p.projectId === projectId
      );

      // 1. 리포트 생성 (솔루션 제목에 맞는 리포트 타입 자동 결정)
      const res = await generateSolutionReport({
        brandId: Number(brandId),
        projectId: Number(projectId),
        projectName: selectedProject?.name || "",
        question,
        solutionTitle,
        solutionDescription,
        relatedProblems: data?.problems || [],
        relatedInsights: data?.insights || [],
        keywordStatsSummary: "",
        reportType: "marketing", // 기본값 (솔루션 제목에 따라 자동 결정 가능)
        traceId,
      });

      if (res.data?.ok && res.data?.report) {
        const reportContent = res.data.report.content;

        // 2. 리포트를 Solution 상품으로 저장
        const saveRes = await saveReportAsSolution({
          brandId: Number(brandId),
          projectId: Number(projectId),
          solutionTitle,
          reportContent,
          reportType: "marketing",
          traceId,
        });

        if (saveRes.data?.ok) {
          // 성공 메시지 표시
          alert(
            saveRes.data.isFree
              ? "리포트가 무료로 생성되었습니다. 상품 목록에서 확인하세요."
              : "리포트가 생성되었습니다. 상품 목록에서 구매하세요."
          );

          // 무료 리포트 개수 다시 조회
          getFreeReportCount(brandId)
            .then((count) => {
              setFreeReportCount(count || 0);
            })
            .catch((err) => {
              console.error("무료 리포트 개수 조회 실패", err);
            });

          // 상품 목록 페이지로 이동 (또는 새로고침)
          // window.location.href = `/market/${brandId}/${projectId}`;
        } else {
          setReportError(saveRes.data?.reason || "리포트 저장에 실패했습니다.");
        }
      } else {
        setReportError(res.data?.reason || "리포트 생성에 실패했습니다.");
      }
    } catch (e) {
      console.error("[StrategyPage] 리포트 생성 오류", e);
      setReportError(
        getErrorMessage(e) || "리포트 생성 중 오류가 발생했습니다."
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  const renderSection = (title, items) => {
    const colors = getSectionColor(title);
    const isSolutions = title === "Solutions";

    return (
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className={`px-5 py-4 border-b ${colors.border} ${colors.bg}`}>
          <h4
            className={`text-sm font-bold ${colors.text} flex items-center gap-2`}
          >
            {colors.icon && <span>{colors.icon}</span>}
            {title}
          </h4>
        </div>
        <div className="p-5">
          {Array.isArray(items) && items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((it, idx) => {
                const itemText =
                  typeof it === "string" ? it : JSON.stringify(it);
                return (
                  <li
                    key={idx}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                  >
                    <div className="text-sm text-gray-800 leading-relaxed mb-3">
                      {itemText}
                    </div>
                    {isSolutions && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleGenerateReport(itemText, "")}
                          disabled={generatingReport}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {generatingReport
                            ? "리포트 생성 중..."
                            : "📊 AI 리포트 생성하기"}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center">
              내용 없음
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 헤더 / 액션 */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">전략 추천</h2>
              <p className="text-sm text-gray-600 mt-2">
                프로젝트 데이터를 분석하여 문제점과 솔루션을 추천합니다.
              </p>

              {/* 프로젝트 선택 */}
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">
                  프로젝트 <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId ?? ""}
                  onChange={(e) =>
                    setProjectId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">프로젝트 선택</option>
                  {projectList.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {projectId && (
                  <span className="text-xs text-gray-500">
                    {projectList.find((p) => p.projectId === projectId)
                      ?.keywordCount || 0}
                    개 키워드
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={loading || !projectId || !question?.trim()}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all shrink-0
                ${
                  loading || !projectId || !question?.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
                }`}
            >
              {loading ? "분석 중..." : "추천 받기"}
            </button>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              질문 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
              placeholder="예) 가격이 비싸다는 불만이 많은데, 원인과 해결책을 제안해줘&#10;예) 최근 반응 기반으로 문제/해결책을 추천해줘"
            />
            {!question?.trim() && (
              <p className="mt-2 text-xs text-red-500">
                질문을 입력해주세요. (필수)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              질문을 입력하면 해당 관점에서 프로젝트 데이터를 분석합니다.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span>검색 개수</span>
              <input
                type="number"
                value={topK}
                min={1}
                max={5}
                onChange={(e) => setTopK(e.target.value)}
                className="w-20 p-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </label>
            <div className="text-xs text-gray-500">
              템플릿 매칭 개수 (권장: 3~5)
            </div>
          </div>
        </div>
      </div>

      {/* traceId / 상태 */}
      {traceId && (
        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">traceId:</span> {traceId}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                분석 중...
              </div>
              <div className="text-xs text-gray-500 mt-1">
                보통 1~3분 소요 예정
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-lg">⚠️</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-700 mb-1">
                오류 발생
              </div>
              <div className="text-sm text-red-700 whitespace-pre-wrap">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결과 영역 */}
      {result && (
        <div className="space-y-6">
          {/* 실패 */}
          {!ok && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-yellow-800 mb-1">
                    요청 실패
                  </div>
                  <div className="text-sm text-yellow-800">
                    {result?.reason || "알 수 없는 오류가 발생했습니다."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 성공 */}
          {ok && (
            <>
              {/* 리포트 요약본 (LLM 생성) */}
              {result?.report && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📊</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          <span className="text-red-600">AI</span> 전략 리포트
                          (요약본)
                        </h3>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          <div>
                            분석 대상:{" "}
                            {result.report.summary?.analysisTarget || "N/A"}
                          </div>
                          <div>
                            데이터 기준:{" "}
                            <span className="text-red-600 font-semibold">
                              최근 SNS 반응
                            </span>
                          </div>
                          <div>
                            핵심 이슈{" "}
                            {result.report.summary?.keyIssuesCount || 0}개
                          </div>
                          <div>실행 전략 정리</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* 핵심 이슈 */}
                    {result.report.keyIssues &&
                      result.report.keyIssues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-2">
                            핵심 이슈
                          </h4>
                          <div className="space-y-2">
                            {result.report.keyIssues
                              .slice(0, 5)
                              .map((issue, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                >
                                  <div className="text-sm font-semibold text-red-800">
                                    {issue.title}
                                  </div>
                                  {issue.description && (
                                    <div className="text-xs text-red-700 mt-1">
                                      {issue.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* 실행 전략 */}
                    {result.report.strategies &&
                      result.report.strategies.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-2">
                            실행 전략
                          </h4>
                          <div className="space-y-2">
                            {result.report.strategies
                              .slice(0, 5)
                              .map((strategy, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                                >
                                  <div className="text-sm font-semibold text-green-800">
                                    {strategy.title}
                                  </div>
                                  {strategy.description && (
                                    <div className="text-xs text-green-700 mt-1">
                                      {strategy.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* 경영진 요약 */}
                    {result.report.executiveSummary && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs font-semibold text-blue-800 mb-2">
                          경영진 요약
                        </div>
                        <div className="text-sm text-blue-900">
                          {result.report.executiveSummary}
                        </div>
                      </div>
                    )}

                    {/* 리포트 전체 보기 링크 */}
                    <div className="pt-2">
                      <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                        [리포트 전체 보기]
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 무료 리포트 안내 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                      📊
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        무료 리포트 생성
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-black text-blue-600 text-base">
                          {freeReportCount}
                        </span>
                        <span className="text-gray-500"> / 1</span>
                        <span className="text-gray-600 ml-2">
                          {freeReportCount >= 1
                            ? "무료 리포트를 모두 사용하셨습니다. 추가 리포트는 유료로 생성됩니다."
                            : "1개까지 무료로 생성 가능합니다."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기본 결과 (템플릿 매칭 결과) */}
              <div className="grid grid-cols-1 gap-5">
                {renderSection("Solutions", data?.solutions)}
              </div>

              {/* Sources */}
              <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-gray-50">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span>📎</span>
                    근거 (Sources)
                  </h4>
                </div>
                <div className="p-5">
                  {Array.isArray(sources) && sources.length > 0 ? (
                    <div className="space-y-3">
                      {sources.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {s.title || s.url || `근거 ${idx + 1}`}
                            </div>
                            {s.source && (
                              <div className="text-xs text-gray-500 mt-1">
                                {s.source}
                              </div>
                            )}
                          </div>
                          {s.url && (
                            <button
                              onClick={() => window.open(s.url, "_blank")}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors shrink-0"
                            >
                              열기
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      근거 없음
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 리포트 모달 */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {currentReport?.title || "AI 전략 리포트"}
              </h3>
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setCurrentReport(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {reportError ? (
                <div className="text-red-600">{reportError}</div>
              ) : currentReport?.content ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800">
                  {currentReport.content.split("\n").map((line, idx) => {
                    if (line.startsWith("# ")) {
                      return (
                        <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">
                          {line.substring(2)}
                        </h1>
                      );
                    } else if (line.startsWith("## ")) {
                      return (
                        <h2 key={idx} className="text-xl font-bold mt-5 mb-3">
                          {line.substring(3)}
                        </h2>
                      );
                    } else if (line.startsWith("### ")) {
                      return (
                        <h3 key={idx} className="text-lg font-bold mt-4 mb-2">
                          {line.substring(4)}
                        </h3>
                      );
                    } else if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p key={idx} className="font-bold my-2">
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    } else if (line.trim() === "") {
                      return <br key={idx} />;
                    } else {
                      return (
                        <p key={idx} className="my-2">
                          {line}
                        </p>
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="text-gray-500">리포트 내용이 없습니다.</div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setCurrentReport(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyPage;
