import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  getInsights,
  getDailyStats,
  getSentimentStats,
  getTokenStats,
  getProjects,
  getProjectKeywords,
} from "../../api/snsApi";
import { Activity, Heart, TrendingUp } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

// Components
import InsightSummaryComponent from "../../components/sns/SentimentTrend/InsightSummaryComponent";
import MentionAnalysisComponent from "../../components/sns/SentimentTrend/MentionAnalysisComponent";
import WordCloudComponent from "../../components/sns/SentimentTrend/WordCloudComponent";
import KeywordRankingComponent from "../../components/sns/SentimentTrend/KeywordRankingComponent";
import SentimentTrendComponent from "../../components/sns/SentimentTrend/SentimentTrendComponent";
import SentimentRatioComponent from "../../components/sns/SentimentTrend/SentimentRatioComponent";

// Utils
import {
  TOKENS,
  sentimentLabel,
  sentimentColor,
  badgeStyle,
} from "../../components/sns/SentimentTrend/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const SentimentTrend = () => {
  const { brandId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedKeywordId, setSelectedKeywordId] = useState(null);
  const [selectedSources, setSelectedSources] = useState(["NAVER", "YOUTUBE"]); // 기본값: 둘 다 선택

  // Data
  const [projects, setProjects] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [insights, setInsights] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [sentimentStats, setSentimentStats] = useState([]);
  const [tokenStats, setTokenStats] = useState([]);

  // UI state
  const [wordView, setWordView] = useState("cloud"); // "cloud" | "table"
  const [activeSentiments, setActiveSentiments] = useState([
    "POS",
    "NEG",
    "NEU",
  ]);
  const [selectedToken, setSelectedToken] = useState(null); // click on word

  /** -----------------------------
   * Fetch projects / keywords
   * ----------------------------- */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(brandId);
        const projectsList = Array.isArray(data) ? data : [];
        setProjects(projectsList);
        
        // 첫번째 프로젝트 자동 선택
        if (projectsList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsList[0].projectId);
        }
      } catch (err) {
        console.error("프로젝트 목록 조회 실패:", err);
        setError("프로젝트 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchProjects();
  }, [brandId]);

  useEffect(() => {
    const fetchKeywords = async () => {
      if (!selectedProjectId) {
        setKeywords([]);
        setSelectedKeywordId(null);
        return;
      }
      try {
        const data = await getProjectKeywords(brandId, selectedProjectId);
        const keywordsList = Array.isArray(data) ? data : [];
        setKeywords(keywordsList);
        
        // 첫번째 키워드 자동 선택 (프로젝트가 변경되었거나 키워드가 없을 때)
        if (keywordsList.length > 0) {
          // 현재 선택된 키워드가 새 키워드 목록에 없으면 첫번째 키워드 선택
          const currentKeywordExists = keywordsList.some(
            (k) => k.keywordId === selectedKeywordId
          );
          if (!currentKeywordExists) {
            setSelectedKeywordId(keywordsList[0].keywordId);
          }
        } else {
          setSelectedKeywordId(null);
        }
      } catch (err) {
        console.error("키워드 목록 조회 실패:", err);
        setError("키워드 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchKeywords();
  }, [brandId, selectedProjectId]);

  /** -----------------------------
   * Fetch main data
   * ----------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSelectedToken(null);

      try {
        // selectedSources가 비어있으면 null (전체), 하나면 그 값, 여러 개면 각각 조회 후 합치기
        let sourceParam = null;
        if (selectedSources.length === 1) {
          sourceParam = selectedSources[0];
        } else if (selectedSources.length > 1) {
          // 여러 소스 선택 시 각 소스별로 조회 후 합치기
          const [
            insightsDataList,
            dailyStatsDataList,
            sentimentStatsDataList,
            tokenStatsDataList,
          ] = await Promise.all([
            Promise.all(
              selectedSources.map((source) =>
                getInsights(
                  brandId,
                  selectedProjectId,
                  selectedKeywordId,
                  source
                )
              )
            ),
            Promise.all(
              selectedSources.map((source) =>
                getDailyStats(
                  brandId,
                  selectedProjectId,
                  selectedKeywordId,
                  null, // competitorId
                  source
                )
              )
            ),
            Promise.all(
              selectedSources.map((source) =>
                getSentimentStats(
                  brandId,
                  selectedProjectId,
                  selectedKeywordId,
                  null, // competitorId
                  source
                )
              )
            ),
            Promise.all(
              selectedSources.map((source) =>
                getTokenStats(
                  brandId,
                  selectedProjectId,
                  selectedKeywordId,
                  null, // competitorId
                  source
                )
              )
            ),
          ]);

          // 데이터 합치기
          const insightsData = insightsDataList.flat();
          const dailyStatsData = dailyStatsDataList.flat();
          const sentimentStatsData = sentimentStatsDataList.flat();
          const tokenStatsData = tokenStatsDataList.flat();

          setInsights(Array.isArray(insightsData) ? insightsData : []);
          setDailyStats(Array.isArray(dailyStatsData) ? dailyStatsData : []);
          setSentimentStats(
            Array.isArray(sentimentStatsData) ? sentimentStatsData : []
          );
          setTokenStats(Array.isArray(tokenStatsData) ? tokenStatsData : []);
          return;
        }

        const [
          insightsData,
          dailyStatsData,
          sentimentStatsData,
          tokenStatsData,
        ] = await Promise.all([
          getInsights(
            brandId,
            selectedProjectId,
            selectedKeywordId,
            sourceParam
          ),
          getDailyStats(
            brandId,
            selectedProjectId,
            selectedKeywordId,
            null, // competitorId
            sourceParam
          ),
          getSentimentStats(
            brandId,
            selectedProjectId,
            selectedKeywordId,
            null, // competitorId
            sourceParam
          ),
          getTokenStats(
            brandId,
            selectedProjectId,
            selectedKeywordId,
            null, // competitorId
            sourceParam
          ),
        ]);

        setInsights(Array.isArray(insightsData) ? insightsData : []);
        setDailyStats(Array.isArray(dailyStatsData) ? dailyStatsData : []);
        setSentimentStats(
          Array.isArray(sentimentStatsData) ? sentimentStatsData : []
        );
        setTokenStats(Array.isArray(tokenStatsData) ? tokenStatsData : []);
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandId, selectedProjectId, selectedKeywordId, selectedSources]);

  /** -----------------------------
   * Derived: Mention trend (Line)
   * ----------------------------- */
  const mentionChartData = useMemo(() => {
    if (!dailyStats.length) return null;

    const dateMap = new Map();
    const sources = new Set();

    dailyStats.forEach((stat) => {
      const dateKey = stat.statDate;
      sources.add(stat.source);

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { bySource: {}, total: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.total += stat.mentionCount;
      entry.bySource[stat.source] =
        (entry.bySource[stat.source] || 0) + stat.mentionCount;
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const palette = [
      "rgb(34, 197, 94)",
      "rgb(59, 130, 246)",
      "rgb(168, 85, 247)",
      "rgb(251, 146, 60)",
      "rgb(239, 68, 68)",
    ];

    const datasets = [];
    // selectedSources가 있으면 선택된 소스만, 없으면 전체
    const sourcesToShow =
      selectedSources.length > 0 ? selectedSources : Array.from(sources);

    sourcesToShow.forEach((source, idx) => {
      const color = palette[idx % palette.length];
      datasets.push({
        label: source,
        data: sortedDates.map((d) => dateMap.get(d)?.bySource[source] || 0),
        borderColor: color,
        backgroundColor: `${color}22`,
        tension: 0.25,
        pointRadius: selectedSources.length === 1 ? 2 : 1.5,
        pointHoverRadius: 4,
        fill: idx === 0, // 첫 라인만 살짝 면
      });
    });

    return { labels: sortedDates, datasets };
  }, [dailyStats, selectedSources]);

  /** -----------------------------
   * Derived: Sentiment ratios
   * - Note: you currently average ratios across rows. (kept same)
   * ----------------------------- */
  const sentimentAverages = useMemo(() => {
    if (!sentimentStats.length) {
      return { pos: 0, neg: 0, neu: 0 };
    }
    let totalPos = 0;
    let totalNeg = 0;
    let totalNeu = 0;

    sentimentStats.forEach((stat) => {
      totalPos += Number(stat.positiveRatio || 0);
      totalNeg += Number(stat.negativeRatio || 0);
      totalNeu += Number(stat.neutralRatio || 0);
    });

    const count = sentimentStats.length || 1;
    return {
      pos: totalPos / count,
      neg: totalNeg / count,
      neu: totalNeu / count,
    };
  }, [sentimentStats]);

  const positiveRatioText = useMemo(() => {
    const v = sentimentAverages.pos;
    return Number.isFinite(v) ? `${v.toFixed(1)}%` : "0.0%";
  }, [sentimentAverages.pos]);

  /** -----------------------------
   * Derived: Sentiment stacked bar (daily)
   * ----------------------------- */
  const sentimentBarData = useMemo(() => {
    if (!sentimentStats.length) return null;

    const dateMap = new Map();
    sentimentStats.forEach((stat) => {
      const dateKey = stat.statDate;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { pos: 0, neg: 0, neu: 0, count: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.pos += Number(stat.positiveRatio || 0);
      entry.neg += Number(stat.negativeRatio || 0);
      entry.neu += Number(stat.neutralRatio || 0);
      entry.count += 1;
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    const rows = sortedDates.map((d) => {
      const e = dateMap.get(d);
      const c = e.count || 1;
      return { pos: e.pos / c, neg: e.neg / c, neu: e.neu / c };
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "긍정",
          data: rows.map((r) => r.pos),
          backgroundColor: `${TOKENS.color.positive}D9`,
          borderRadius: 2,
        },
        {
          label: "중립",
          data: rows.map((r) => r.neu),
          backgroundColor: "rgba(156, 163, 175, 0.55)",
          borderRadius: 2,
        },
        {
          label: "부정",
          data: rows.map((r) => r.neg),
          backgroundColor: `${TOKENS.color.negative}D9`,
          borderRadius: 2,
        },
      ],
    };
  }, [sentimentStats]);

  /** -----------------------------
   * Derived: Doughnut data
   * ----------------------------- */
  const sentimentDoughnutData = useMemo(() => {
    if (!sentimentStats.length) return null;

    return {
      labels: ["긍정", "부정", "중립"],
      datasets: [
        {
          data: [
            sentimentAverages.pos,
            sentimentAverages.neg,
            sentimentAverages.neu,
          ],
          backgroundColor: [
            `${TOKENS.color.positive}CC`,
            `${TOKENS.color.negative}CC`,
            "rgba(156, 163, 175, 0.70)",
          ],
          borderColor: [
            TOKENS.color.positive,
            TOKENS.color.negative,
            TOKENS.color.neutral,
          ],
          borderWidth: 1.5,
          hoverOffset: 3,
          cutout: "68%",
        },
      ],
    };
  }, [sentimentStats, sentimentAverages]);

  /** -----------------------------
   * Derived: Word data (token stats -> aggregated)
   * ----------------------------- */
  const rawWordData = useMemo(() => {
    if (!tokenStats.length) {
      console.log("[WordCloud] tokenStats가 비어있습니다.");
      return [];
    }

    console.log("[WordCloud] tokenStats 개수:", tokenStats.length);

    const tokenMap = new Map();
    tokenStats.forEach((stat) => {
      const key = String(stat.token || "").trim();
      if (!key) return;

      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          text: key,
          value: 0,
          sentiment: stat.sentiment, // POS/NEG/NEU
        });
      }
      tokenMap.get(key).value += Number(stat.tokenCount || 0);
    });

    const result = Array.from(tokenMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 60);

    console.log("[WordCloud] rawWordData 생성 완료:", result.length, "개");
    console.log(
      "[WordCloud] 상위 5개:",
      result
        .slice(0, 5)
        .map((w) => ({ text: w.text, value: w.value, sentiment: w.sentiment }))
    );

    return result;
  }, [tokenStats]);

  const wordCloudMeta = useMemo(() => {
    if (!rawWordData.length) return { max: 1, min: 0 };
    let max = 0;
    let min = Number.POSITIVE_INFINITY;
    rawWordData.forEach((w) => {
      if (w.value > max) max = w.value;
      if (w.value < min) min = w.value;
    });
    if (!Number.isFinite(min)) min = 0;
    if (max === min) min = Math.max(0, max - 1);
    return { max, min };
  }, [rawWordData]);

  const wordCloudData = useMemo(() => {
    const filtered = rawWordData.filter((w) =>
      activeSentiments.includes(w.sentiment)
    );

    // 디버깅: 데이터 개수 확인
    console.log(
      "[WordCloud] rawWordData:",
      rawWordData.length,
      "filtered:",
      filtered.length,
      "activeSentiments:",
      activeSentiments
    );

    return filtered;
  }, [rawWordData, activeSentiments]);

  const topWordsBySentiment = useMemo(() => {
    const by = { POS: [], NEG: [], NEU: [] };
    rawWordData.forEach((w) => {
      if (by[w.sentiment]) by[w.sentiment].push(w);
    });
    Object.keys(by).forEach((k) => by[k].sort((a, b) => b.value - a.value));
    return {
      POS: by.POS.slice(0, 2).map((w) => w.text),
      NEG: by.NEG.slice(0, 2).map((w) => w.text),
      NEU: by.NEU.slice(0, 2).map((w) => w.text),
    };
  }, [rawWordData]);

  /** -----------------------------
   * Summary stats
   * ----------------------------- */
  const summaryStats = useMemo(() => {
    if (!dailyStats.length) return null;

    const sourceCounts = {};
    const dateCounts = {};

    dailyStats.forEach((stat) => {
      sourceCounts[stat.source] =
        (sourceCounts[stat.source] || 0) + stat.mentionCount;
      dateCounts[stat.statDate] =
        (dateCounts[stat.statDate] || 0) + stat.mentionCount;
    });

    const topSource = Object.entries(sourceCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topDate = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0];
    const totalMentions = dailyStats.reduce(
      (sum, stat) => sum + stat.mentionCount,
      0
    );

    // 날짜 범위 계산
    const dates = dailyStats.map((stat) => stat.statDate).sort();
    const dateRange = dates.length > 0 
      ? `${dates[0]} ~ ${dates[dates.length - 1]}`
      : "";

    return {
      topSource: topSource ? { name: topSource[0], count: topSource[1] } : null,
      topDate: topDate ? { date: topDate[0], count: topDate[1] } : null,
      totalMentions,
      dateRange,
    };
  }, [dailyStats]);

  /** -----------------------------
   * Chart options (theme)
   * ----------------------------- */
  const baseChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#64748b",
            boxWidth: 8,
            font: { size: 11 },
            padding: 8,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          padding: 10,
          titleFont: { size: 11 },
          bodyFont: { size: 10 },
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 0, autoSkip: true },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9", drawBorder: false },
          ticks: { color: "#94a3b8", font: { size: 10 } },
        },
      },
    };
  }, []);

  const stackedBarOptions = useMemo(() => {
    return {
      ...baseChartOptions,
      scales: {
        ...baseChartOptions.scales,
        x: { ...baseChartOptions.scales.x, stacked: true },
        y: { ...baseChartOptions.scales.y, stacked: true, max: 100 },
      },
    };
  }, [baseChartOptions]);

  const doughnutOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: baseChartOptions.plugins.tooltip,
        doughnutCenterText: {
          title: `긍정 ${positiveRatioText}`,
          subtitle: summaryStats
            ? `총 ${summaryStats.totalMentions.toLocaleString()}건`
            : "",
        },
      },
    };
  }, [baseChartOptions.plugins.tooltip, positiveRatioText, summaryStats]);

  /** -----------------------------
   * Actions
   * ----------------------------- */
  const toggleSentiment = (s) => {
    setActiveSentiments((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  /** -----------------------------
   * UI
   * ----------------------------- */
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Page Header */}
      <PageHeader
        icon={TrendingUp}
        title="감성 / 트렌드 분석"
        breadcrumb="Analytics / Sentiment & Trend"
        subtitle="브랜드의 소셜 미디어 언급량과 감성 트렌드를 분석하여 인사이트를 제공합니다."
      />

      {/* Filters */}
      <div className="sticky top-8 z-50 w-full flex justify-center pointer-events-none transition-all duration-500 mb-4">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-5 py-2 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 gap-4 pointer-events-auto transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-500 uppercase tracking-widest transition-colors">Filter</span>
          </div>

          {/* Project */}
          <div className="flex items-center gap-2 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <select
              value={selectedProjectId || ""}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="">프로젝트</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword */}
          <div className="flex items-center gap-2 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <select
              value={selectedKeywordId || ""}
              onChange={(e) =>
                setSelectedKeywordId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={!selectedProjectId}
              className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">키워드</option>
              {keywords.map((k) => (
                <option key={k.keywordId} value={k.keywordId}>
                  {k.keyword}
                </option>
              ))}
            </select>
          </div>

          {/* Source Toggles */}
          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">NAVER</span>
            <button
              onClick={() => {
                setSelectedSources((prev) =>
                  prev.includes("NAVER")
                    ? prev.filter((s) => s !== "NAVER")
                    : [...prev, "NAVER"]
                );
              }}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                selectedSources.includes("NAVER") ? 'bg-green-500/60 group-hover:bg-green-500' : 'bg-gray-200/40 group-hover:bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  selectedSources.includes("NAVER") ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2.5 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">YOUTUBE</span>
            <button
              onClick={() => {
                setSelectedSources((prev) =>
                  prev.includes("YOUTUBE")
                    ? prev.filter((s) => s !== "YOUTUBE")
                    : [...prev, "YOUTUBE"]
                );
              }}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-all ${
                selectedSources.includes("YOUTUBE") ? 'bg-red-500/60 group-hover:bg-red-500' : 'bg-gray-200/40 group-hover:bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                  selectedSources.includes("YOUTUBE") ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {selectedToken && (
            <div className="flex items-center gap-2 border-l border-gray-200/30 group-hover:border-gray-200 pl-4">
              <button
                onClick={() => setSelectedToken(null)}
                className="text-[10px] px-2 py-1 rounded-full border border-blue-200/50 bg-blue-50/50 hover:bg-blue-100 text-blue-700 font-semibold transition-all"
                title="선택한 키워드 해제"
              >
                {selectedToken} ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* States */}
      {error && (
        <div className="w-full bg-white border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 mb-0.5">
                오류가 발생했습니다
              </h3>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                데이터를 불러오는 중...
              </p>
              <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-14">
          {/* 언급량 분석 섹션 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
                Mention Analysis
              </h3>
              <div className="h-px flex-1 bg-slate-200 opacity-50" />
            </div>
            
            {/* 인사이트 - Mention Analysis 섹션 하위 */}
            <InsightSummaryComponent insights={insights} />
            
            <MentionAnalysisComponent
              mentionChartData={mentionChartData}
              summaryStats={summaryStats}
              selectedSources={selectedSources}
              baseChartOptions={baseChartOptions}
            />
          </section>

          {/* 긍/부정 분석 섹션 */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                <Heart size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">
                Sentiment Insight
              </h3>
              <div className="h-px flex-1 bg-slate-200 opacity-50" />
            </div>
            <div className="w-full bg-white flex flex-col border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-8">

            {/* 워드클라우드 + 순위표 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 워드클라우드 */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                <WordCloudComponent
                  wordCloudData={wordCloudData}
                  wordCloudMeta={wordCloudMeta}
                  wordView={wordView}
                  setWordView={setWordView}
                  activeSentiments={activeSentiments}
                  toggleSentiment={toggleSentiment}
                  selectedToken={selectedToken}
                  setSelectedToken={setSelectedToken}
                  tokenStats={tokenStats}
                />
              </div>

              {/* 순위표 */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm min-h-[450px] overflow-hidden">
                <KeywordRankingComponent wordCloudData={wordCloudData} />
              </div>
            </div>

            {/* 긍부정 추이 + 긍부정 비율 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 min-h-[350px] shadow-sm">
                <SentimentTrendComponent
                  sentimentBarData={sentimentBarData}
                  stackedBarOptions={stackedBarOptions}
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 min-h-[350px] shadow-sm">
                <SentimentRatioComponent
                  sentimentDoughnutData={sentimentDoughnutData}
                  sentimentAverages={sentimentAverages}
                  doughnutOptions={doughnutOptions}
                  summaryStats={summaryStats}
                />
              </div>
            </div>
            </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SentimentTrend;
