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
} from "../../api/analyticsApi";

// Components
import InsightSummaryComponent from "../../components/sns/SentimentTrend/InsightSummaryComponent";
import MentionAnalysisComponent from "../../components/sns/SentimentTrend/MentionAnalysisComponent";
import WordCloudComponent from "../../components/sns/SentimentTrend/WordCloudComponent";
import KeywordRankingComponent from "../../components/sns/SentimentTrend/KeywordRankingComponent";
import SentimentTrendComponent from "../../components/sns/SentimentTrend/SentimentTrendComponent";
import SentimentRatioComponent from "../../components/sns/SentimentTrend/SentimentRatioComponent";

// Utils
import { TOKENS, sentimentLabel, sentimentColor, badgeStyle } from "../../components/sns/SentimentTrend/utils";

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
  const [selectedSources, setSelectedSources] = useState([]); // 배열로 변경: ["NAVER", "YOUTUBE"]

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
  const [wordSearch, setWordSearch] = useState("");

  /** -----------------------------
   * Fetch projects / keywords
   * ----------------------------- */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(brandId);
        setProjects(Array.isArray(data) ? data : []);
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
        setKeywords(Array.isArray(data) ? data : []);
        setSelectedKeywordId(null);
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
            Promise.all(selectedSources.map(source => getInsights(brandId, selectedProjectId, selectedKeywordId, source))),
            Promise.all(selectedSources.map(source => getDailyStats(brandId, selectedProjectId, selectedKeywordId, source))),
            Promise.all(selectedSources.map(source => getSentimentStats(brandId, selectedProjectId, selectedKeywordId, source))),
            Promise.all(selectedSources.map(source => getTokenStats(brandId, selectedProjectId, selectedKeywordId, source))),
          ]);

          // 데이터 합치기
          const insightsData = insightsDataList.flat();
          const dailyStatsData = dailyStatsDataList.flat();
          const sentimentStatsData = sentimentStatsDataList.flat();
          const tokenStatsData = tokenStatsDataList.flat();

          setInsights(Array.isArray(insightsData) ? insightsData : []);
          setDailyStats(Array.isArray(dailyStatsData) ? dailyStatsData : []);
          setSentimentStats(Array.isArray(sentimentStatsData) ? sentimentStatsData : []);
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
            sourceParam
          ),
          getSentimentStats(
            brandId,
            selectedProjectId,
            selectedKeywordId,
            sourceParam
          ),
          getTokenStats(
            brandId,
            selectedProjectId,
            selectedKeywordId,
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
    const sourcesToShow = selectedSources.length > 0 ? selectedSources : Array.from(sources);
    
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
    console.log("[WordCloud] 상위 5개:", result.slice(0, 5).map(w => ({ text: w.text, value: w.value, sentiment: w.sentiment })));
    
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
    const q = wordSearch.trim().toLowerCase();

    const filtered = rawWordData
      .filter((w) => activeSentiments.includes(w.sentiment))
      .filter((w) => (q ? w.text.toLowerCase().includes(q) : true));
    
    // 디버깅: 데이터 개수 확인
    console.log("[WordCloud] rawWordData:", rawWordData.length, "filtered:", filtered.length, "activeSentiments:", activeSentiments, "wordSearch:", wordSearch);
    
    return filtered;
  }, [rawWordData, activeSentiments, wordSearch]);

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

    return {
      topSource: topSource ? { name: topSource[0], count: topSource[1] } : null,
      topDate: topDate ? { date: topDate[0], count: topDate[1] } : null,
      totalMentions,
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
            color: TOKENS.color.subtext,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.92)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(229, 231, 235, 0.6)" },
          ticks: { color: TOKENS.color.axis, maxRotation: 0, autoSkip: true },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(229, 231, 235, 0.8)" },
          ticks: { color: TOKENS.color.axis },
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
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 rounded-2xl shadow-xl border border-indigo-100/50 p-8 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                감성 / 트렌드 분석
              </h1>
              <p className="text-gray-600 font-medium">
                키워드별 언급량 및 감성 분포를 확인하고, 원인 키워드로 빠르게 해석하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20" />
        <div className="relative flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">필터</h2>
          </div>
          {selectedToken && (
            <button
              onClick={() => setSelectedToken(null)}
              className="text-xs px-4 py-2 rounded-full border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-all duration-200 hover:scale-105 shadow-sm"
              title="선택한 키워드 해제"
            >
              선택 키워드 해제:{" "}
              <span className="font-bold">{selectedToken}</span>
            </button>
          )}
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              프로젝트
            </label>
            <div className="relative">
              <select
                value={selectedProjectId || ""}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 shadow-sm hover:shadow-md font-medium text-gray-900"
              >
                <option value="">전체 프로젝트</option>
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Keyword */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              키워드
            </label>
            <div className="relative">
              <select
                value={selectedKeywordId || ""}
                onChange={(e) =>
                  setSelectedKeywordId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={!selectedProjectId}
                className="w-full p-3.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 shadow-sm hover:shadow-md font-medium text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {selectedProjectId ? "전체 키워드" : "프로젝트를 먼저 선택하세요"}
                </option>
                {keywords.map((k) => (
                  <option key={k.keywordId} value={k.keywordId}>
                    {k.keyword}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Toggles */}
          <div className="group md:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              소스
            </label>
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { 
                  value: "NAVER", 
                  label: "NAVER", 
                  activeColor: "bg-green-500", 
                  activeBorder: "border-green-500",
                  focusRing: "focus:ring-green-500",
                  hoverColor: "hover:bg-green-400"
                },
                { 
                  value: "YOUTUBE", 
                  label: "YOUTUBE", 
                  activeColor: "bg-red-500", 
                  activeBorder: "border-red-500",
                  focusRing: "focus:ring-red-500",
                  hoverColor: "hover:bg-red-400"
                },
              ].map((source) => {
                const isActive = selectedSources.includes(source.value);
                return (
                  <div key={source.value} className="flex items-center gap-3">
                    <span className={`text-sm font-semibold min-w-[90px] transition-colors ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {source.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSources((prev) =>
                          prev.includes(source.value)
                            ? prev.filter((s) => s !== source.value)
                            : [...prev, source.value]
                        );
                      }}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${
                        isActive
                          ? `${source.activeColor} ${source.activeBorder} ${source.focusRing} ${source.hoverColor}`
                          : "bg-gray-300 border-gray-300 focus:ring-gray-400 hover:bg-gray-400"
                      }`}
                      role="switch"
                      aria-checked={isActive}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                          isActive ? "translate-x-9" : "translate-x-1"
                        }`}
                      />
                      <span
                        className={`absolute text-[10px] font-bold transition-opacity duration-200 ${
                          isActive 
                            ? "left-2 text-white opacity-100" 
                            : "right-2 text-gray-600 opacity-100"
                        }`}
                      >
                        {isActive ? "On" : "Off"}
                      </span>
                    </button>
                  </div>
                );
              })}
              {selectedSources.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSources([])}
                  className="ml-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  재설정
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* States */}
      {error && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg border-2 border-red-200/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-red-900 mb-1">오류가 발생했습니다</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100"></div>
              <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">데이터를 불러오는 중...</p>
              <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Insights - 필터 바로 아래 */}
          <InsightSummaryComponent insights={insights} />

          {/* 언급량 분석 패널 */}
          <MentionAnalysisComponent
            mentionChartData={mentionChartData}
            summaryStats={summaryStats}
            selectedSources={selectedSources}
            baseChartOptions={baseChartOptions}
          />

          {/* 긍/부정 분석 패널 */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 rounded-2xl shadow-lg border border-purple-100/50 p-8 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    긍/부정 분석
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">감성 키워드 분석</p>
                </div>
              </div>
            </div>

            {/* 워드클라우드 + 순위표 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 워드클라우드 */}
              <WordCloudComponent
                wordCloudData={wordCloudData}
                wordCloudMeta={wordCloudMeta}
                wordView={wordView}
                setWordView={setWordView}
                wordSearch={wordSearch}
                setWordSearch={setWordSearch}
                activeSentiments={activeSentiments}
                toggleSentiment={toggleSentiment}
                selectedToken={selectedToken}
                setSelectedToken={setSelectedToken}
                tokenStats={tokenStats}
              />

              {/* 순위표 */}
              <KeywordRankingComponent wordCloudData={wordCloudData} />
            </div>

            {/* 긍부정 추이 + 긍부정 비율 (3:1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t">
              <SentimentTrendComponent
                sentimentBarData={sentimentBarData}
                stackedBarOptions={stackedBarOptions}
              />

              <SentimentRatioComponent
                sentimentDoughnutData={sentimentDoughnutData}
                sentimentAverages={sentimentAverages}
                doughnutOptions={doughnutOptions}
                summaryStats={summaryStats}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SentimentTrend;
